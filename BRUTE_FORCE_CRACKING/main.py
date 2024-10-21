import hashlib, string, time, math
ListoFHashes = [
        "f14aae6a0e050b74e4b7b9a5b2ef1a60ceccbbca39b132ae3e8bf88d3a946c6d8687f3266fd2b626419d8b67dcf1d8d7c0fe72d4919d9bd05efbd37070cfb41a",
        "e85e639da67767984cebd6347092df661ed79e1ad21e402f8e7de01fdedb5b0f165cbb30a20948f1ba3f94fe33de5d5377e7f6c7bb47d017e6dab6a217d6cc24",
        "4e2589ee5a155a86ac912a5d34755f0e3a7d1f595914373da638c20fecd7256ea1647069a2bb48ac421111a875d7f4294c7236292590302497f84f19e7227d80",
        "afd66cdf7114eae7bd91da3ae49b73b866299ae545a44677d72e09692cdee3b79a022d8dcec99948359e5f8b01b161cd6cfc7bd966c5becf1dff6abd21634f4b",
        ]

class TaskOne():
    def __init__(self, ListoFHashes: list[str], websocket=None) -> None:
        self.ListoFHashes = ListoFHashes
        self.foundCount = len(ListoFHashes) # just checking if we found all the passworkds in the list
        self.unhashedPasswords = set({})
        self.websocket = websocket
        self.inputString: str = string.ascii_lowercase + '0123456789'

    def generatePasswords(self, concatString: str, maxLength: int):
        """
        A recursive function that recursively interates through the shortlex-order unorderedly
        """
        if len(concatString) == maxLength:
            return 

        # using a tree structure
        for char in self.inputString:
            if self.foundCount < 1:
                break
            hashedString = None
            if concatString not in self.unhashedPasswords:
                hashedString = hashlib.sha512(concatString.encode()).hexdigest()
            if hashedString in self.ListoFHashes and hashedString is not None:
                self.unhashedPasswords.add(concatString)
                self.foundCount -= 1
                return
            self.generatePasswords(concatString + char, maxLength)

        return 


    def checkHash(self, results=""):
        maxLength = len(self.inputString)
        startTime = time.time()
        for length in range(1, maxLength):
            if self.foundCount > 0:
                self.generatePasswords("", length)
        endTime = time.time()
        print(f"It took {round(endTime - startTime, 2)}seconds to find the passwords:\n {self.unhashedPasswords}")



if __name__ == "__main__":
    task1: TaskOne = TaskOne(ListoFHashes=ListoFHashes)
    task1.checkHash()



