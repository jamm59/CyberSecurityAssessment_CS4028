import asyncio
from websockets.server import serve
from BRUTE_FORCE_CRACKING.main import TaskOne, ListoFHashes
from DICTIONARY_ATTACK.main import TaskTwo, hashedPasswords
from DICTIONARY_CRACKING_WITH_SALTS.main import TaskThree, inputHashedAndSaltedPair

# async def crack_password(websocket):
#     # Placeholder logic for password cracking
#     for i in range(5):  # Simulate 5 steps of cracking
#         await asyncio.sleep(1)  # Simulate time delay for cracking
#         await websocket.send(f"Cracking step {i+1} complete")
#     await websocket.send("Password cracking complete!")

async def handle_message(websocket, path):
    task1: TaskOne = TaskOne(ListoFHashes=ListoFHashes, websocket=websocket)
    task2: TaskTwo = TaskTwo(hashedPasswords=hashedPasswords, websocket=websocket)
    task3: TaskThree = TaskThree(inputHashedAndSaltedPair=inputHashedAndSaltedPair, websocket=websocket)
    if "crack" in path:
        # await crack_password(websocket)
        if "1" in path:
            await task1.checkHash() 
        elif "2" in path:
            await task2.checkHash()
        elif "3" in path:
            await task3.checkHash()  

async def main():
    port = 5000
    print(f"WebSocket running on localhost:{port}")
    async with serve(handle_message, "localhost", port):
        await asyncio.get_running_loop().create_future()

asyncio.run(main())
