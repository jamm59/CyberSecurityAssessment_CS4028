package main

import (
	"crypto/sha512"
	"encoding/hex"
	"fmt"
	"log"
	"sync"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/websocket/v2"
)

var (
	inputString  string = "abcdefghijklmnopqrstuvwxyz0123456789"
	listOfHashes        = [...]string{
		"f14aae6a0e050b74e4b7b9a5b2ef1a60ceccbbca39b132ae3e8bf88d3a946c6d8687f3266fd2b626419d8b67dcf1d8d7c0fe72d4919d9bd05efbd37070cfb41a",
		"e85e639da67767984cebd6347092df661ed79e1ad21e402f8e7de01fdedb5b0f165cbb30a20948f1ba3f94fe33de5d5377e7f6c7bb47d017e6dab6a217d6cc24",
		"4e2589ee5a155a86ac912a5d34755f0e3a7d1f595914373da638c20fecd7256ea1647069a2bb48ac421111a875d7f4294c7236292590302497f84f19e7227d80",
		"afd66cdf7114eae7bd91da3ae49b73b866299ae545a44677d72e09692cdee3b79a022d8dcec99948359e5f8b01b161cd6cfc7bd966c5becf1dff6abd21634f4b",
	}
	foundCount        int             = len(listOfHashes)
	unhashedPasswords map[string]bool = make(map[string]bool)
	mu                sync.Mutex      // To synchronize access to shared data
	wg                sync.WaitGroup
	semaphore         chan struct{} = make(chan struct{}, 110000) // Semaphore to limit the number of goroutines
)

// Hashes a string using SHA512
func sha512Hash(input string) string {
	hash := sha512.Sum512([]byte(input))
	return hex.EncodeToString(hash[:])
}

// Check if the hash exists in the predefined list of hashes
func containsHash(hash string) bool {
	for _, h := range listOfHashes {
		if h == hash {
			return true
		}
	}
	return false
}

// Password generation and cracking
func generatePasswords(concatString string, maxLength int, ws *websocket.Conn) {
	defer wg.Done()
	defer func() { <-semaphore }()


	if len(concatString) == maxLength {
		return
	}

	mu.Lock()
	if err := ws.WriteMessage(websocket.TextMessage, []byte(concatString)); err != nil {
		fmt.Println("Error sending cracked password:", err)
		return
	}
	mu.Unlock()

	for _, char := range inputString {
		if foundCount < 1 {
			break
		}
		hashedString := sha512Hash(concatString)
		mu.Lock()
		if containsHash(hashedString) && !unhashedPasswords[concatString] {
			unhashedPasswords[concatString] = true
			// Send cracked password via WebSocket
			if err := ws.WriteMessage(websocket.TextMessage, []byte("result==" + concatString)); err != nil {
				fmt.Println("Error sending cracked password:", err)
				return
			}
			fmt.Println(concatString)
			foundCount--
			mu.Unlock()
			return
		}
		mu.Unlock()

		select {
		case semaphore <- struct{}{}:
			wg.Add(1)
			go generatePasswords(concatString+string(char), maxLength, ws)
		default:
			generatePasswords(concatString+string(char), maxLength, ws)
		}
	}
}

// Crack passwords and update the client via WebSocket
func checkHash(ws *websocket.Conn) {
	for length := 1; length < 5; length++ {
		if foundCount > 0 {
			wg.Add(1)
			semaphore <- struct{}{}
			generatePasswords("", length, ws)
		}
	}

	// Wait for all goroutines to finish
	wg.Wait()
	if err := ws.WriteMessage(websocket.TextMessage, []byte("All passwords cracked!")); err != nil {
		fmt.Println("Error sending final message:", err)
	}
}

func main() {
	// Create a new Fiber instance
	app := fiber.New()

	// WebSocket endpoint for cracking passwords
	app.Get("/crack", websocket.New(func(c *websocket.Conn) {
		fmt.Println("WebSocket connected")

		// Start password cracking
		checkHash(c)
		foundCount = len(listOfHashes);
		unhashedPasswords = make(map[string]bool)

		// Close the WebSocket connection when done
		defer func() {
			if err := c.Close(); err != nil {
				fmt.Println("Error closing WebSocket:", err)
			}
		}()
	}))

	// Serve the app on port 8000
	log.Println("WebSocket server running on ws://localhost:8000/crack")
	log.Fatal(app.Listen(":8000"))
}
