import Moment from 'react-moment';
import React, { useState, useEffect } from 'react';
import { withChatkitOneToOne } from '@pusher/chatkit-client-react';

import './Chat.css';
import defaultAvatar from './default-avatar.png';

function Chat(props) {
  //first is the value, second is the function
  const [pendingMessage, setPendingMessage] = useState('');
  const [file, setFile] = useState('');
  const messageList = React.createRef();

  const handleMessageKeyDown = event => {
    if (event.key === 'Enter') {
      handleSendMessage();
    }
  };

  const handleMessageChange = event => {
    setPendingMessage(event.target.value);
    setFile(event.target.files[0]);
  };

  const handleSendMessage = () => {
    if (pendingMessage !== '') {
      props.chatkit.sendSimpleMessage({ text: pendingMessage });
    }
    if (file) {
      props.chatkit.sendMultipartMessage({ parts: [{ file: file }] });
    }
    console.log(file);

    setPendingMessage('');
  };

  useEffect(() => {
    messageList.current.scrollTop = messageList.current.scrollHeight;
  });

  const messages = props.chatkit.messages.map(m => ({
    id: m.id,
    isOwnMessage: m.sender.id === props.chatkit.currentUser.id,
    createdAt: m.createdAt,
    // This will only work with simple messages.
    // To learn more about displaying multi-part messages see
    // https://pusher.com/docs/chatkit/reference/javascript#messages
    textContent: m.parts[0].payload.content,
  }));

  return (
    <div className="Chat">
      <div className="Chat__titlebar">
        <img
          src={defaultAvatar}
          className="Chat__titlebar__avatar"
          alt="avatar"
        />
        <div className="Chat__titlebar__details">
          <span>
            {props.chatkit.isLoading
              ? 'Loading...'
              : props.chatkit.otherUser.name}
          </span>
        </div>
      </div>
      <div className="Chat__messages" ref={messageList}>
        {messages.map(m => (
          <Message key={m.id} {...m} />
        ))}
      </div>
      <div className="Chat__compose">
        <input type="file" onChange={handleMessageChange}></input>
        <input
          className="Chat__compose__input"
          type="text"
          placeholder="Type a message..."
          value={pendingMessage}
          onChange={handleMessageChange}
          onKeyDown={handleMessageKeyDown}
        />
        <button className="Chat__compose__button" onClick={handleSendMessage}>
          Send
        </button>
      </div>
    </div>
  );
}

function Message({ isOwnMessage, isLatestMessage, createdAt, textContent }) {
  return (
    <div
      className={
        isOwnMessage
          ? 'Chat__messages__message__wrapper Chat__messages__message__wrapper--self'
          : 'Chat__messages__message__wrapper Chat__messages__message__wrapper--other'
      }
    >
      <div className="Chat__messages__message__wrapper__inner">
        <div
          className={
            isOwnMessage
              ? 'Chat__messages__message Chat__messages__message--self'
              : 'Chat__messages__message Chat__messages__message--other'
          }
        >
          <div className="Chat__messages__message__content">{textContent}</div>
          <div className="Chat__messages__message__time">
            <Moment
              calendar={{
                sameDay: 'LT',
                lastDay: '[Yesterday at] LT',
                lastWeek: '[last] dddd [at] LT',
              }}
            >
              {createdAt}
            </Moment>
          </div>
          <div
            className={
              isOwnMessage
                ? 'Chat__messages__message__arrow alt'
                : 'Chat__messages__message__arrow'
            }
          />
        </div>
      </div>
    </div>
  );
}

export default withChatkitOneToOne(Chat);
