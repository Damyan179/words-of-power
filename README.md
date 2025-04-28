# overthink-rps

Project made in collaboration with AndreiBalan-dev for the BEST Engineering Marathon 2025 Hackathon challenge.

The challenge:
    Inside the competition system, choose from a list of 77 words, selecting the one that can defeat the system's word at the cheapest price.
    Each word on the list has a fixed price, for example:
        Fire: $20
        Earthquake: $60
        Nuclear bomb: $80
        Time: $100
    Our job was to pick the best word to compete against the system's word. The matchups were judged by an LLM to decide the winner:
        Player: Fire vs System: Water → Player wins
        Player: Radiation vs System: Time → System wins
    The main challenge was that we had no idea what words the system would choose, but during the competition, we were able to call the system's API to work with a selection of its words for our machine learning model.
    For our machine learning project, we used the following Python libraries:
        Flask: A web framework for creating web servers and APIs
        joblib: For efficiently saving and loading Python objects
        pandas: For data manipulation and analysis
        scikit-learn: For machine learning in Python
    We also used JavaScript to enable our Python module to interact with the system's APIs and OpenAI.
