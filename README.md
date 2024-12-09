Here’s a GitHub README file for your Discord TTS bot project, along with separate documentation for easy setup and usage.

---

## **Discord TTS Bot**

A Discord bot that reads messages from a text channel and plays them as text-to-speech (TTS) in a voice channel. The bot supports multiple TTS engines, which can be configured via a `.env` file.

---

### **Features**
- Joins voice channels and reads text messages aloud.
- Configurable TTS engines: Google, espeak, and others (through `.env`).
- Supports custom TTS engines (e.g., Faster-Whisper, Google TTS, espeak-ng).
- Easy-to-use Slash Commands: `/joinvc`.

---

### **Installation**

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Shirozy/DiscordTTS
   cd DiscordTTS
   ```

2. **Install dependencies**:
   Make sure you have `Node.js` installed on your machine. Then run:
   ```bash
   npm install
   ```

3. **Set up `.env` file**:
   Create a `.env` file in the root of the project and add your bot token and TTS engine type:

   Example `.env`:
   ```env
   TOKEN=your-discord-bot-token
   TTS_TYPE=espeak  # Change to 'google' or any other engine you add
   ```

4. **Install required packages for TTS**:
   Depending on your chosen TTS engine, you may need to install additional dependencies.

   For **espeak-ng**:
   - **Linux**: `sudo apt install espeak-ng`
   - **macOS**: `brew install espeak-ng`

   For **Google TTS**:
   ```bash
   npm install node-gtts
   ```

5. **Run the bot**:
   After configuring the `.env` file and installing dependencies, run the bot with:
   ```bash
   node tts.js
   ```

---

### **Commands**
- `/joinvc` – Joins the user's voice channel and starts listening to messages from the text channel. The bot will read aloud messages in that channel using TTS.

---

### **TTS Engines**
The bot currently supports the following TTS engines:

- **Google TTS** (`google`): Uses `node-gtts` to convert text to speech.
- **espeak-ng** (`espeak`): Uses the system's `espeak-ng` for local speech synthesis.

You can configure the TTS engine by setting the `TTS_TYPE` in the `.env` file:
- `TTS_TYPE=google`
- `TTS_TYPE=espeak`

Additional TTS engines can be added by modifying the `generateTTS` function in the `tts.js` file.

---

## **Documentation**

### **TTS Engines Overview**

- **Google TTS (`node-gtts`)**:
   Uses Google’s Text-to-Speech service. You can configure this engine by setting `TTS_TYPE=google` in the `.env` file. The bot will use the `node-gtts` library to convert text to speech.

- **espeak-ng**:
   A lightweight and fast text-to-speech system. This engine runs locally and does not require an internet connection. To use this engine, set `TTS_TYPE=espeak` in the `.env` file.

---

### **Bot Commands**

1. **/joinvc**  
   Command to have the bot join the voice channel and read messages aloud. The bot will only read messages from the text channel it was summoned from.

---

### **Changing the TTS Engine**

To switch between different TTS engines:

1. Update the `TTS_TYPE` in the `.env` file:
   - For **Google TTS**:  
     ```env
     TTS_TYPE=google
     ```
   - For **espeak**:  
     ```env
     TTS_TYPE=espeak
     ```

2. Add any additional TTS engines in the `generateTTS` function inside `index.js`.

Example:
```javascript
if (ttsType === 'google') {
  const gTTS = require('node-gtts')('en');
  return new Promise((resolve, reject) => {
    gTTS.save(outputPath, text, err => {
      if (err) reject(err);
      else resolve();
    });
  });
}
```

---

### **Contributing**

Feel free to submit a pull request if you'd like to contribute to this project. Please ensure that you adhere to the project's coding standards and provide tests for new features.

---

### **Troubleshooting**

1. **Bot not responding to messages**:
   - Ensure the bot has permission to join the voice channel and read messages in the text channel.
   - Verify that the correct TTS engine is set in the `.env` file and the necessary system dependencies are installed.

2. **Missing `espeak-ng` or `node-gtts`**:
   - Install the necessary TTS engine via the package manager for your OS or via `npm install node-gtts`.

---

### **License**

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
