// @flow
import React, { Component } from "react";
import { render } from "react-dom";

type AppState = {
  input: string,
  notes: Array<Note>,
  dragPosition: ?DragPosition,
  edit: ?Note
};

type Note = {
  id: string,
  title: string,
  text: string,
  x: number,
  y: number,
  visible: boolean
};

type DragPosition = {
  noteId: string,
  startXY: XY,
  xy: XY
};

type XY = { x: number, y: number };

class App extends Component {
  state: AppState = JSON.parse(
    localStorage.getItem("custom-notes") || "null"
  ) || { input: "", notes: [], dragPosition: null, edit: null };

  componentDidMount = () => {
    window.addEventListener("mousemove", this.handleMouseMove);
    window.addEventListener("mouseup", this.handleMouseUp);
  };

  componentWillUnmount = () => {
    window.removeEventListener("mousemove", this.handleMouseMove);
    window.removeEventListener("mouseup", this.handleMouseUp);
  };

  componentWillUpdate = (nextProps, nextState) => {
    if (!nextState.dragPosition) {
      localStorage.setItem("custom-notes", JSON.stringify(nextState));
    }
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
        title: "Note",
        text: input,
        x: 50,
        y: 50,
        visible: true
      })
    });
  };

  handleMouseDown = event => {
    const { clientX: x, clientY: y, target } = event;
    this.setState({
      dragPosition: { noteId: target.id, startXY: { x, y }, xy: { x, y } }
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

  toggleNoteVisibility = noteId => {
    const { notes } = this.state;
    const newNotes = notes.map(note => {
      if (note.id === noteId) {
        return { ...note, visible: !note.visible };
      } else {
        return note;
      }
    });
    this.setState({ notes: newNotes });
  };

  editNote = (note: Note) => {
    this.setState({ edit: note });
  };

  saveNote = (newNote: Note) => {
    const newNotes = this.state.notes.map(
      note => (note.id === newNote.id ? newNote : note)
    );
    this.setState({ edit: null, notes: newNotes });
  };

  cancelEdit = () => {
    this.setState({ edit: null });
  };

  removeNote = noteId => {
    const { notes } = this.state;
    const newNotes = notes.filter(note => note.id !== noteId);
    this.setState({ notes: newNotes });
  };

  render() {
    const { notes, dragPosition, edit } = this.state;

    const dx = dragPosition ? dragPosition.xy.x - dragPosition.startXY.x : 0;
    const dy = dragPosition ? dragPosition.xy.y - dragPosition.startXY.y : 0;
    const noteId = dragPosition ? dragPosition.noteId : null;

    return (
      <div>
        <div className="columns">
          <form
            className="column is-three-quarters-mobile is-one-third-tablet"
            style={{ margin: "20px auto" }}
            onSubmit={this.handleSubmit}
          >
            <input
              value={this.state.input}
              onChange={this.handleInput}
              className="input"
              placeholder="Add a Note"
            />
          </form>
        </div>
        <div style={{ position: "relative" }}>
          {notes.map(note => {
            if (edit && note.id === edit.id) {
              return (
                <EditNote
                  key={note.id}
                  note={edit}
                  editNote={this.editNote}
                  saveNote={this.saveNote}
                  cancelEdit={this.cancelEdit}
                />
              );
            }

            const x =
              dragPosition && dragPosition.noteId === note.id
                ? note.x + dx
                : note.x;
            const y =
              dragPosition && dragPosition.noteId === note.id
                ? note.y + dy
                : note.y;

            return (
              <NoteView
                key={note.id}
                note={{ ...note, x, y }}
                editNote={this.editNote}
                onMouseDown={this.handleMouseDown}
                toggleVisible={this.toggleNoteVisibility}
                removeNote={this.removeNote}
              />
            );
          })}
        </div>
      </div>
    );
  }
}

type NoteProps = {
  note: Note,
  editNote: Note => void,
  onMouseDown: any => void,
  toggleVisible: string => void,
  removeNote: string => void
};

const NoteView = ({
  note,
  editNote,
  onMouseDown,
  toggleVisible,
  removeNote
}: NoteProps) =>
  <div
    style={{
      position: "absolute",
      left: note.x,
      top: note.y,
      width: 300
    }}
    className="card"
  >
    <header className="card-header">
      <p className="card-header-title">
        {note.title}
      </p>
      <a className="card-header-icon">
        <span className="icon">
          <i
            className="fa fa-arrows-alt"
            id={note.id}
            onMouseDown={onMouseDown}
          />
        </span>
      </a>
      <a className="card-header-icon">
        <span className="icon">
          <i
            className="fa fa-angle-down"
            onClick={() => toggleVisible(note.id)}
          />
        </span>
      </a>
    </header>
    {note.visible
      ? <div>
          <div className="card-content">
            <div className="content">
              {note.text}
            </div>
          </div>
          <footer className="card-footer">
            <a className="card-footer-item" onClick={() => editNote(note)}>
              Edit
            </a>
            <a className="card-footer-item" onClick={() => removeNote(note.id)}>
              Delete
            </a>
          </footer>
        </div>
      : ""}
  </div>;

type EditNoteProps = {
  note: Note,
  editNote: Note => void,
  saveNote: Note => void,
  cancelEdit: () => void
};

const EditNote = ({ note, editNote, saveNote, cancelEdit }: EditNoteProps) =>
  <div
    key={note.id}
    style={{
      position: "absolute",
      left: note.x,
      top: note.y,
      width: 300
    }}
    className="card"
  >
    <header className="card-header">
      <p className="card-header-title">
        <input
          value={note.title}
          onChange={e => editNote({ ...note, title: e.target.value })}
          className="input"
        />
      </p>
    </header>
    <div>
      <div className="card-content">
        <div className="content">
          <textarea
            value={note.text}
            onChange={e => editNote({ ...note, text: e.target.value })}
            className="input"
            style={{ height: 115 }}
          />
        </div>
      </div>
      <footer className="card-footer">
        <a className="card-footer-item" onClick={() => saveNote(note)}>
          Save
        </a>
        <a className="card-footer-item" onClick={cancelEdit}>
          Cancel
        </a>
      </footer>
    </div>
  </div>;

render(<App />, document.querySelector("#root"));
