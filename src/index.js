// @flow
import React, { Component } from "react";
import { render } from "react-dom";

type AppState = {
  input: string,
  notes: Array<Note>,
  dragPosition: ?DragPosition
};

type Note = {
  id: string,
  text: string,
  x: number,
  y: number,
  width: number,
  height: number
};

type DragPosition = {
  noteId: number,
  startXY: XY,
  xy: XY
};

type XY = { x: number, y: number };

class App extends Component {
  state: AppState = { input: "", notes: [], dragPosition: null };

  componentDidMount = () => {
    window.addEventListener("mousemove", this.handleMouseMove);
    window.addEventListener("mouseup", this.handleMouseUp);
  };

  componentWillUnmount = () => {
    window.removeEventListener("mousemove", this.handleMouseMove);
    window.removeEventListener("mouseup", this.handleMouseUp);
  };

  handleInput = event => {
    this.setState({ input: event.target.value });
  };

  handleSubmit = event => {
    event.preventDefault();
    const { input, notes } = this.state;
    this.setState({
      input: "",
      notes: notes.concat({
        id: String(Math.random()),
        text: input,
        x: 50,
        y: 50,
        width: 200,
        height: 200
      })
    });
  };

  handleMouseDown = event => {
    const { clientX: x, clientY: y, target: { id } } = event;
    this.setState({
      dragPosition: { noteId: id, startXY: { x, y }, xy: { x, y } }
    });
  };

  handleMouseMove = event => {
    const { dragPosition } = this.state;
    if (dragPosition) {
      const { clientX: x, clientY: y } = event;
      this.setState({ dragPosition: { ...dragPosition, xy: { x, y } } });
    }
  };

  handleMouseUp = event => {
    if (this.state.dragPosition) {
      const { noteId, startXY, xy } = this.state.dragPosition;
      const dx = xy.x - startXY.x;
      const dy = xy.y - startXY.y;

      const newNotes = this.state.notes.map(note => {
        if (note.id === noteId) {
          return { ...note, x: note.x + dx, y: note.y + dy };
        } else {
          return note;
        }
      });

      this.setState({ dragPosition: null, notes: newNotes });
    }
  };

  render() {
    const { notes, dragPosition } = this.state;

    const dx = dragPosition ? dragPosition.xy.x - dragPosition.startXY.x : 0;
    const dy = dragPosition ? dragPosition.xy.y - dragPosition.startXY.y : 0;
    const noteId = dragPosition ? dragPosition.noteId : null;

    return (
      <div>
        <div>
          <form onSubmit={this.handleSubmit}>
            <input value={this.state.input} onChange={this.handleInput} />
          </form>
        </div>
        <div style={{ position: "relative" }}>
          {notes.map(note =>
            <div
              key={note.id}
              style={{
                position: "absolute",
                left: note.x + (note.id === noteId ? dx : 0),
                top: note.y + (note.id === noteId ? dy : 0),
                width: 300
              }}
              className="card"
            >
              <header className="card-header">
                <p className="card-header-title">Note</p>
                <a className="card-header-icon">
                  <span className="icon">
                    <i
                      className="fa fa-arrows-alt"
                      id={note.id}
                      onMouseDown={this.handleMouseDown}
                    />
                  </span>
                </a>
                <a className="card-header-icon">
                  <span className="icon">
                    <i className="fa fa-angle-down" />
                  </span>
                </a>
              </header>
              <div className="card-content">
                <div className="content">
                  {note.text}
                </div>
              </div>
              <footer className="card-footer">
                <a className="card-footer-item">Save</a>
                <a className="card-footer-item">Edit</a>
                <a className="card-footer-item">Delete</a>
              </footer>
            </div>
          )}
        </div>
      </div>
    );
  }
}

render(<App />, document.querySelector("#root"));
