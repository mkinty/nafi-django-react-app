import React, { Component } from "react";
import "./App.css";

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      todoList: [],
      activeItem: {
        id: null,
        title: "",
        completed: false,
      },
      editing: false,
    };
    this.fetchTasks = this.fetchTasks.bind(this);

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);

    this.getCookie = this.getCookie.bind(this);

    this.startEdit = this.startEdit.bind(this);
    this.deleteItem = this.deleteItem.bind(this);
    this.strikeUnstrike = this.strikeUnstrike.bind(this);
  }

  // CSRF - TOKEN
  getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== "") {
      const cookies = document.cookie.split(";");
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        // Does this cookie string begin with the name we want?
        if (cookie.substring(0, name.length + 1) === name + "=") {
          cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
          break;
        }
      }
    }
    return cookieValue;
  }

  componentDidMount() {
    this.fetchTasks();
  }

  fetchTasks() {
    console.log("Fetching ...");
    fetch("https://nafi-rdapp.herokuapp.com/api/task-list/")
      .then((response) => response.json())
      .then((data) =>
        this.setState({
          todoList: data,
        })
      );
  }

  handleChange(e) {
    let name = e.target.name;
    let value = e.target.value;
    console.log("onHandleChange ... Name :", name);
    console.log("onHandleChange ... Value :", value);
    this.setState({
      activeItem: {
        ...this.state.activeItem,
        title: value,
      },
    });
  }

  handleSubmit(e) {
    e.preventDefault();
    console.log("ITEM", this.state.activeItem);
    const csrftoken = this.getCookie("csrftoken");
    let url = "https://nafi-rdapp.herokuapp.com/api/task-create/";
    if (this.state.editing === true) {
      url = `https://nafi-rdapp.herokuapp.com/api/task-update/${this.state.activeItem.id}/`;
      this.setState({
        editing: false,
      });
    }
    fetch(url, {
      method: "POST",
      headers: {
        "Content-type": "application/json",
        "X-CSRFToken": csrftoken,
      },
      body: JSON.stringify(this.state.activeItem),
    })
      .then((response) => {
        this.fetchTasks();
        this.setState({
          activeItem: {
            id: null,
            title: "",
            completed: false,
          },
        });
      })
      .catch(function (error) {
        console.log("ERROR...", error);
      });
  }

  startEdit(task) {
    this.setState({
      activeItem: task,
      editing: true,
    });
  }

  deleteItem(task) {
    const csrftoken = this.getCookie("csrftoken");
    fetch(`https://nafi-rdapp.herokuapp.com/api/task-delete/${task.id}/`, {
      method: "DELETE",
      headers: {
        "Content-type": "application/json",
        "X-CSRFToken": csrftoken,
      },
    }).then((response) => {
      this.fetchTasks();
    });
  }

  strikeUnstrike(task) {
    task.completed = !task.completed;
    console.log("TASK", task.completed);
    const csrftoken = this.getCookie("csrftoken");
    const url = `https://nafi-rdapp.herokuapp.com/api/task-update/${task.id}/`;
    fetch(url, {
      method: "POST",
      headers: {
        "Content-type": "application/json",
        "X-CSRFToken": csrftoken,
      },
      body: JSON.stringify({ completed: task.completed, title: task.title }),
    }).then((response) => {
      this.fetchTasks();
    });
  }

  render() {
    let tasks = this.state.todoList;
    let self = this;

    return (
      <div className="container">
        <div id="task-container">
          <div id="form-wrapper">
            <form onSubmit={this.handleSubmit} id="form">
              <div className="flex-wrapper">
                <div className="title-content">
                  <input
                    onChange={this.handleChange}
                    id="title"
                    className="form-control"
                    type="text"
                    value={this.state.activeItem.title}
                    name="title"
                    placeholder="Add task"
                  />
                </div>
                <div className="title-submit">
                  <input id="submit" className="btn" type="submit" />
                </div>
              </div>
            </form>
          </div>

          <div id="list-wrapper">
            {tasks.map(function (task, index) {
              return (
                <div key={index} className="task-wrapper ">
                  <div
                    onClick={() => self.strikeUnstrike(task)}
                    className="task-content"
                  >
                    {task.completed === false ? (
                      <span>{task.title}</span>
                    ) : (
                      <strike>{task.title}</strike>
                    )}
                  </div>

                  <div className="task-btn">
                    <button
                      onClick={() => self.startEdit(task)}
                      className="btn  btn-edit"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => self.deleteItem(task)}
                      className="btn btn-delete"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }
}
