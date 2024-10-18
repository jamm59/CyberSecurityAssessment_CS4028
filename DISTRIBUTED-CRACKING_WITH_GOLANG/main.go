package main

import (
	"crypto/sha512"
	"encoding/hex"
	"fmt"
	"log"
	"net/http"
	"sync"

	socketio "github.com/googollee/go-socket.io"
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

func generatePasswords(concatString string, maxLength int, s socketio.Conn) {
	defer wg.Done()                // Decrement the WaitGroup counter when the goroutine completes
	defer func() { <-semaphore }() // Release a slot in the semaphore when done

	if len(concatString) == maxLength {
		return
	}

	for _, char := range inputString {
		if foundCount < 1 {
			break
		}

		hashedString := sha512Hash(concatString)

		mu.Lock() // Lock access to shared resources (foundCount, unhashedPasswords)
		if containsHash(hashedString) && !unhashedPasswords[concatString] {
			unhashedPasswords[concatString] = true
			s.Emit("cracked_password", concatString) // Send the cracked password to the client via WebSocket
			foundCount--
			mu.Unlock() // Unlock after updating the shared data
			return
		}
		mu.Unlock()

		select {
		case semaphore <- struct{}{}: // Try to acquire a slot in the semaphore
			wg.Add(1)
			go generatePasswords(concatString+string(char), maxLength, s)
		default:
			// If no slot is available, use regular recursion
			generatePasswords(concatString+string(char), maxLength, s)
		}
	}
}

func sha512Hash(input string) string {
	hash := sha512.Sum512([]byte(input))
	return hex.EncodeToString(hash[:])
}

func containsHash(hash string) bool {
	for _, h := range listOfHashes {
		if h == hash {
			return true
		}
	}
	return false
}

func checkHash(s socketio.Conn) {
	for length := 1; length < 5; length++ {
		if foundCount > 0 {
			wg.Add(1)                           // Add to the WaitGroup for the main recursive call
			semaphore <- struct{}{}             // Acquire a slot in the semaphore
			go generatePasswords("", length, s) // Pass WebSocket connection to each goroutine
		}
	}
	wg.Wait()                                               // Wait for all goroutines to finish
	s.Emit("crack_complete", "Password cracking completed") // Notify the client
}

func main() {
	server()
}

func server() {
	server := socketio.NewServer(nil)

	server.OnConnect("/", func(s socketio.Conn) error {
		s.SetContext("")
		fmt.Println("connected:", s.ID())
		return nil
	})

	// Define the /crack route for cracking passwords
	server.OnEvent("/", "crack", func(s socketio.Conn, msg string) {
		fmt.Println("Starting password cracking...")
		checkHash(s) // Start password cracking and send updates via WebSocket
	})

	server.OnError("/", func(s socketio.Conn, e error) {
		fmt.Println("meet error:", e)
	})

	server.OnDisconnect("/", func(s socketio.Conn, reason string) {
		fmt.Println("closed", reason)
	})

	go server.Serve()
	defer server.Close()

	http.Handle("/socket.io/", server)
	http.Handle("/", http.FileServer(http.Dir("./asset")))
	log.Println("Serving at localhost:8000...")
	log.Fatal(http.ListenAndServe(":8000", nil))
}
