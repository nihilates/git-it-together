// Resources http://beatscodeandlife.ghost.io/react-socket-io-part-i-real-time-chat-application/
// http://danialk.github.io/blog/2013/06/16/reactjs-and-socket-dot-io-chat-application/

// Insert into outer componenet to render:   <ChatApp user={this.state.profile.nickname} room={this.state.}></ChatApp>

//TO DO: Set limit on number of messages to display

import React from 'react';
import ReactDom from 'react-dom';
var socket = io('/io/chatroom');
var moment = require('moment-timezone');

var Message = React.createClass({
  render() {
    return (
      <div className="message">
        <strong className="messageUser">{this.props.user}</strong>
        <span className="messageDate">{this.props.createdAt}</span><br />
        <span className="messageText">{this.props.text}</span>
      </div>
    );
  }
});

var MessageList = React.createClass({
  componentDidUpdate() {
    this.scrollElement();
  },

  //This keeps the scroll in the chatroom at the bottom
  scrollElement() {
    var context = this;
    //Use setTimeout to place this at the bottom of the stack
    setTimeout(() => {
      window.requestAnimationFrame(() => {
        var node = ReactDom.findDOMNode(context);
        if (node !== undefined) {
          node.scrollTop = node.scrollHeight;
        }
      });
    }, 0);
  },

  render() {
    return (
      <div className='messages'>
        {
          this.props.messages.map((message, i) => {
            return (
              <Message
                key={i}
                user={message.user}
                text={message.text}
                room={message.room}
                createdAt={moment.utc(message.createdAt).startOf('second').fromNow()}
              />
            );
          })
        }
      </div>
    );
  }
});

var MessageForm = React.createClass({
  getInitialState() {
    return {text: ''};
  },

  handleSubmit(e) {
    e.preventDefault();
    var message = {
      user : this.props.user,
      text : this.state.text,
      room: this.props.room,
      createdAt: moment.utc().format()
    }
    this.props.onMessageSubmit(message);
    this.setState({ text: '' });
  },

  changeHandler(e) {
    this.setState({ text : e.target.value });
  },

  render() {
    return(
      <div className='message_form'>
        <hr />
        <form onSubmit={this.handleSubmit}>
          <input placeholder='Add to the conversation!'
            onChange={this.changeHandler}
            value={this.state.text}
            className="form-control mb-2 mr-sm-2 mb-sm-0"
          />
        </form>
      </div>
    );
  }
});

// Main component:
var ChatApp = React.createClass({

  getInitialState() {
    return {messages:[], searchTerms: ''};
  },

  componentDidMount() {
    socket.on('init', this._initialize);
    socket.emit('room', this.props.room);
    socket.on('message', this._messageRecieve);
    socket.on('savedMessages', this._savedMessagesReceive);
  },

  _messageRecieve(message) {
    var {messages} = this.state;
    messages.push(message);
    this.setState({messages});
    console.log('MESSAGES: ------> ', this.state.messages);
  },

  _savedMessagesReceive(messages) {
    this.setState({messages});
  },

  handleMessageSubmit(message) {
    var {messages} = this.state;
    this.setState({messages});
    socket.emit('message', message);
  },

//FLAGGED FOR DEATH
  // handleSubmit(e) {
  //   e.preventDefault();
  //   var message = {
  //     user : this.props.user,
  //     text : this.state.text,
  //     room: this.props.room,
  //     createdAt: moment.utc().format()
  //   }
  //   this.props.onMessageSubmit(message);
  //   this.setState({ text: '' });
  // },

//FLAGGED FOR DEATH^
  changeHandler(e) {
    this.setState({ searchTerms : e.target.value });
  },

  printChat(e) {
    e.preventDefault();//stops page from automatically refreshing
    var results = [];//container for matching chat messages
    var log = this.state.messages;//sets log to be the current cache of messages
    var terms = this.state.searchTerms.replace(/ /g, '').split(',');//removed empty space and breaks string of search terms into array seperated by comma
    var record = {};//bank to store already found terms, to avoid duplicates

    for (let msg=0; msg<log.length; msg++) {//for each message in the chat log...
      for (let term=0; term<terms.length; term++) {//and for each term in our search...
        if (log[msg].text.includes(terms[term]) ) {//if the given term is somewhere in the chat log...
          if (!record[ log[msg].createdAt ]) {//and if that a specific chat message isn't already tracked...
            results.push(log[msg]);//add the entire chat data to the results array
            record[ log[msg].createdAt ] = true;//and track that the chat has been added, to avoid duplicates
          }
        }
      }
    }
    //HERE IS THE PLACE TO BEGIN EXPORTING CHAT LOGS
    this.setState({searchTerms: ''})
  },

  render() {
    return (
      <div>
        <h2>Chat about {this.props.room}</h2>
        <form id="searchChat" onSubmit={this.printChat}>
          <div className="col-10">
            <input id="chatTerms" placeholder="Search chats"
              onChange={this.changeHandler}
              value={this.state.searchTerms}
              className="form-control mb-2 mr-sm-2 mb-sm-0"
            />
          </div>
          <div className="col-2">
            <button type="submit" className="btn btn-sm btn-default">Export</button>
          </div>
        </form>
        <hr />
        <MessageList
          messages={this.state.messages}
        />
        <MessageForm
          onMessageSubmit={this.handleMessageSubmit}
          user={this.props.user}
          room={this.props.room}
        />
      </div>
    );
  }
});

module.exports = ChatApp;
