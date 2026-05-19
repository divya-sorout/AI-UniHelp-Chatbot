# University Chatbot Explanation

Welcome to the UniHelp project! This document explains how this web application works and how the different components communicate.

## Overview

UniHelp is an AI-powered university assistant chatbot. It provides a modern, premium user interface (UI) to interact with a Google Dialogflow backend. The goal is to provide students with quick, conversational access to university information.

## File Structure

The entire application is primarily built using standard web technologies in a single file:

- **`public/index.html`**: This is the core file. It contains:
  - **HTML**: The structure of the application (Splash Screen, Login Screen, and Chat Interface).
  - **CSS**: The styling that makes the app look sleek, dark-themed, and modern. It uses advanced techniques like *glassmorphism* (blurring backgrounds to look like frosted glass) and animations (like the floating 3D avatar).
  - **JavaScript**: The logic that handles page transitions, user login validation, and the most important part—communicating with the Dialogflow bot.
- **`public/chat.png`**: A high-quality 3D render used as the main graphic for the AI bot on the splash and login screens.

## How the Chatbot Works

This project connects a custom-designed chat UI to a powerful AI model managed via **Google Dialogflow**. Here is a step-by-step of how it works under the hood:

### 1. The Dialogflow Widget
Google provides a default chatbot widget called `<df-messenger>`. In this project, we include that widget in the HTML, but we use CSS to **completely hide it** from the user's view (`opacity: 0`, `position: fixed`, `bottom: -9999px`). 

Why do we keep it if we hide it? Because the widget does all the heavy lifting of connecting to Google's servers securely. By keeping it hidden, we can build a much more beautiful, customized chat interface on top of it.

### 2. Sending Messages
When you type a message into our custom chat box and hit "Send", our custom JavaScript function (`sendMsg()`) grabs your text. It then looks deep inside the hidden `<df-messenger>` widget (using a technique called accessing the `shadowRoot`), finds the widget's internal hidden input field, pastes your text in there, and programmatically "clicks" its hidden send button.

### 3. Receiving Messages
Once the hidden widget sends the message to Google and gets a response back, it fires a specific event called `df-response-received`. 
Our JavaScript constantly listens for this event. As soon as it fires, our code catches the response text sent by Dialogflow and dynamically creates a new "message bubble" in our custom, premium chat interface.

## Summary

By running a hidden instance of the official Dialogflow Messenger and using JavaScript as a bridge, this project successfully combines a highly customized, premium User Interface with a robust AI backend without compromising on aesthetics.
