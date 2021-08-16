import React, { Component } from "react";
import "./JokesList.css";
import Joke from "./Joke";
import axios from "axios";

const config = { headers: { Accept: "application/json" } };

interface JokesListProps {
  numJokesToGet: number;
}

interface JokesListState {
  jokes: any[];
  loading: boolean;
}

class JokesList extends Component<JokesListProps, JokesListState> {
  seenJokes: Set<any>;

  static defaultProps = {
    numJokesToGet: 10,
  };

  constructor(props: JokesListProps) {
    super(props);

    this.state = {
      jokes: JSON.parse(window.localStorage.getItem("jokes") || "[]"),
      loading: false,
    };
    this.seenJokes = new Set(this.state.jokes.map((j) => j.text));
    console.log(this.seenJokes);

    this.handleVote = this.handleVote.bind(this);
    this.handleClick = this.handleClick.bind(this);
  }

  async componentDidMount() {
    if (this.state.jokes.length === 0) this.getJokes();
  }

  async getJokes() {
    try {
      let jokes: any[] = [];
      while (jokes.length < this.props.numJokesToGet) {
        let res = await axios.get<{ joke: string; id: string }>(
          "https://icanhazdadjoke.com/",
          config
        );
        let newJoke = res.data.joke;

        if (!this.seenJokes.has(newJoke)) {
          this.seenJokes.add(newJoke);

          jokes.push({ text: res.data.joke, id: res.data.id, votes: 0 });
        } else {
          console.log("Duplicate found!");
          console.log(res.data.joke);
        }
      }
      //console.log(this.seenJokes);

      this.setState(
        (st) => ({
          loading: false,
          jokes: [...st.jokes, ...jokes],
        }),
        () => {
          window.localStorage.setItem(
            "jokes",
            JSON.stringify(this.state.jokes)
          );
        }
      );
    } catch (error) {
      alert(error);
      console.log(error);
      this.setState({ loading: false });
    }
  }

  handleClick() {
    this.setState({ loading: true }, () => {
      this.getJokes();
    });
  }

  handleVote(id: string, delta: number) {
    this.setState(
      (st) => ({
        jokes: st.jokes.map((j) => {
          if (j.id === id) {
            return { ...j, votes: j.votes + delta };
          }
          return { ...j };
        }),
      }),
      () => {
        window.localStorage.setItem("jokes", JSON.stringify(this.state.jokes));
      }
    );
  }
  render() {
    if (this.state.loading) {
      return (
        <div className="JokesList-spinner">
          <i className="far fa-8x fa-laugh fa-spin" />
          <h1 className="JokesList-title">Loading... </h1>
        </div>
      );
    }

    return (
      <div className="JokesList">
        <div className="JokesList-sidebar">
          <h1 className="JokesList-title">
            <span>Dad</span> Jokes
          </h1>
          <img src="https://assets.dryicons.com/uploads/icon/svg/8927/0eb14c71-38f2-433a-bfc8-23d9c99b3647.svg" />
          <button className="JokesList-getmore" onClick={this.handleClick}>
            Fetch Jokes
          </button>
        </div>

        <div className="JokesList-jokes">
          {this.state.jokes
            .map((j) => (
              <Joke
                key={j.id}
                text={j.text}
                votes={j.votes}
                upvote={() => this.handleVote(j.id, 1)}
                downvote={() => this.handleVote(j.id, -1)}
              />
            ))
            .sort((a, b) => b.props.votes - a.props.votes)}
        </div>
      </div>
    );
  }
}

export default JokesList;
