# Chat Application

Welcome to the Chat Application! This application is designed for real-time messaging with support for contacts, rooms, and file attachments. The front end is built with React, while the backend uses XMPP (Extensible Messaging and Presence Protocol) for messaging.

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Configuration](#configuration)
- [License](#license)

## Features

- **User Authentication**: Users can log in and log out of the application.
- **Account Management**: Options to delete accounts and add new contacts.
- **Real-Time Messaging**: Send and receive messages in real time.
- **File Attachments**: Attach and send files in chat.
- **Group Chats**: Create and join chat rooms.
- **Contact Management**: View contact details and presence status.
- **Notifications**: Display success and error notifications.
- **Popups**: Interactive popups for user actions (e.g., adding contacts, creating rooms).

## Installation

To get started with the application, follow these steps:

1. **Clone the Repository**

   ```bash
   git clone https://github.com/stiv2202/Proyecto_Redes
   cd Proyecto_Redes
   ```

2. Install Dependencies

    Install the React dependencies:
    ```
    npm install || yarn
    ```

3. Start the Application
    ```
    yarn dev
    ```

## Usage

### Authentication

- **Login**: Users can log in using their XMPP credentials through the login page.
- **Logout**: Users can log out of the application using the logout button available on the main page.

### Account Management

- **Delete Account**: Users can permanently delete their account by clicking the "Delete Account" button on the main page. This action will prompt a confirmation popup to ensure the user intends to delete their account.

### Messaging

- **Send Message**: 
  - Type your message in the input field.
  - You can also attach files using the file input.
  - Press the send button or hit Enter to send the message.
- **Receive Message**: Incoming messages will appear in real-time in the chat window. Notifications will be displayed for new messages if no contact is currently selected.

### Contacts

- **Add Contact**:
  - Click the "Add Contact" button.
  - Enter the JID (Jabber ID) of the contact in the popup input field.
  - Confirm to add the contact to your contact list.
- **View Contact Details**:
  - Click on a contact's JID to view their details, including their JID, name, subscription status, and presence status.

### Rooms

- **Create Room**:
  - Click the "Create new room" button.
  - Enter a name for the room in the popup input field.
  - Provide a nickname for yourself in the subsequent popup.
  - Confirm to create the room.
- **Join Room**:
  - Click on the room’s JID from the list of available rooms.
  - Enter your nickname in the popup.
  - Confirm to join the room and start chatting.

## Configuration

### Environment Variables

Below is a list of required environment variables in consts.js:

```
REACT_APP_XMPP_SERVER_URL=ws://your-xmpp-server-url:port/ws
REACT_APP_XMPP_DOMAIN=your-xmpp-domain
REACT_APP_XMPP_RESOURCE=your-xmpp-resource
```
Replace your-xmpp-server-url, port, your-xmpp-domain, and your-xmpp-resource with your XMPP server's details.

### XMPP Configuration
Make sure your XMPP server is configured to allow connections from your application. The server should be set up to handle the WebSocket connection and provide the necessary endpoints for authentication, messaging, and presence updates.

### Dependencies
The project relies on several Node.js packages and libraries. Ensure the following dependencies are installed:

- React: For building the user interface.
- Strophe.js: For XMPP communication.
- React Spinners: For loading indicators.
- React Icons: For UI icons.
- Axios: For making HTTP requests.
- Prop-Types: For prop type checking.
- Sass: For SCSS styles.

Run npm install to install the necessary dependencies listed in '*package.json*'.

### Webpack Configuration
The project uses Webpack for bundling. Configuration files are located in the '*config*' directory. You can modify these files if you need to adjust the build process or include additional plugins.

### SSL/TLS Configuration
For production environments, ensure that SSL/TLS is configured to secure the WebSocket connections. This will involve setting up an SSL certificate and configuring your server to use wss:// instead of ws://.

### Popup Configuration
The application uses popups for user interactions. Customize the PopUp component to adjust the design and behavior of popups as needed. The component is located in the '*src/components/PopUp*' directory.

### Troubleshooting
- Connection Issues: Ensure that the XMPP server URL and credentials are correct. Verify that your server is running and accessible.
- Missing Dependencies: Check that all required Node.js packages are installed. Run npm install to install any missing packages.
- Build Errors: Check the Webpack and Babel configuration files for errors. Make sure all required loaders and plugins are correctly configured.

For additional help, consult the documentation for the specific libraries and tools you are using or reach out to the community for support.

### License
This project is licensed under the MIT License - see the LICENSE file for details.

### Contact
 For any questions or issues, please reach out to erickguerra2201@gmail.com.
