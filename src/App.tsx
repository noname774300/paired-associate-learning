import React, { useEffect, useState } from "react";
import "./App.css";

type Pair = { question: string; rightAnswer: string };

const pairs: Pair[] = [
  { question: "ペミ", rightAnswer: "ロチ" },
  { question: "テス", rightAnswer: "トン" },
  { question: "モン", rightAnswer: "ダイ" },
];

const learningTimeSeconds = 5;

type Learning = {
  phase: "learning";
  started: boolean;
  indexOfPair: number;
  numberOfTry: number;
};

type Answer = {
  phase: "answer";
  indexOfPair: number;
  answer: string;
  numberOfCorrectAnswers: number;
  numberOfTry: number;
};

type Intermediate = {
  phase: "intermediate";
  numberOfCorrectAnswers: number;
  numberOfTry: number;
};

type Result = {
  phase: "result";
  numberOfTry: number;
};

type State = Learning | Answer | Intermediate | Result;
type StartToLearn = () => void;
type GoToNextPair = () => void;
type ChangeAnswer = (answer: string) => void;
type ConfirmAnswer = () => void;
type GoToNextPhase = () => void;

function App(): JSX.Element {
  const [state, setState] = useState<State>({
    phase: "learning",
    started: false,
    indexOfPair: 0,
    numberOfTry: 1,
  });
  const goNext = () => {
    switch (state.phase) {
      case "learning": {
        setState({
          phase: "answer",
          indexOfPair: 0,
          answer: "",
          numberOfCorrectAnswers: 0,
          numberOfTry: state.numberOfTry,
        });
        break;
      }
      case "answer": {
        // This case is delegated to confirmAnswer function.
        break;
      }
      case "intermediate": {
        setState({
          phase: "learning",
          started: false,
          indexOfPair: 0,
          numberOfTry: state.numberOfTry + 1,
        });
        break;
      }
      case "result": {
        setState({
          phase: "learning",
          started: false,
          indexOfPair: 0,
          numberOfTry: 1,
        });
        break;
      }
    }
  };
  return (
    <div>
      <header>
        <h1></h1>
      </header>
      <main>
        {state.phase === "learning" ? (
          <Learning
            state={state}
            startToLearn={() => setState({ ...state, started: true })}
            goToNextPair={() =>
              setState({ ...state, indexOfPair: state.indexOfPair + 1 })
            }
            goToNextPhase={goNext}
          />
        ) : state.phase === "answer" ? (
          <Answer
            state={state}
            changeAnswer={(answer: string) => setState({ ...state, answer })}
            confirmAnswer={() => {
              const numberOfCorrectAnswers =
                state.numberOfCorrectAnswers +
                (state.answer === pairs[state.indexOfPair].rightAnswer ? 1 : 0);
              const currentPairIsLast = state.indexOfPair === pairs.length - 1;
              if (currentPairIsLast) {
                numberOfCorrectAnswers < pairs.length
                  ? setState({
                      phase: "intermediate",
                      numberOfCorrectAnswers,
                      numberOfTry: state.numberOfTry,
                    })
                  : setState({
                      phase: "result",
                      numberOfTry: state.numberOfTry,
                    });
                return;
              }
              setState({
                ...state,
                indexOfPair: state.indexOfPair + 1,
                answer: "",
                numberOfCorrectAnswers: numberOfCorrectAnswers,
              });
            }}
          />
        ) : state.phase === "intermediate" ? (
          <Intermediate state={state} goToNextPhase={goNext} />
        ) : (
          <Result state={state} goToNextPhase={goNext} />
        )}
      </main>
    </div>
  );
}

function Learning(props: {
  state: Learning;
  startToLearn: StartToLearn;
  goToNextPair: GoToNextPair;
  goToNextPhase: GoToNextPhase;
}) {
  useEffect(() => {
    if (!props.state.started) return;
    const timeoutID = setTimeout(() => {
      const currentPairIsLast = props.state.indexOfPair === pairs.length - 1;
      currentPairIsLast ? props.goToNextPhase() : props.goToNextPair();
    }, learningTimeSeconds * 1000);
    return () => clearTimeout(timeoutID);
  });
  return (
    <div>
      <div>{props.state.numberOfTry}回目の学習</div>
      {props.state.started ? (
        <>
          <div>
            {pairs.length}ペア中{props.state.indexOfPair + 1}ペア目
          </div>
          <div>
            {pairs[props.state.indexOfPair].question}、
            {pairs[props.state.indexOfPair].rightAnswer}
          </div>
        </>
      ) : (
        <>
          <div>これから単語のペアが1個ずつ表示されます。</div>
          <div>例：ペミ、ロチ</div>
          <div>{learningTimeSeconds}秒以内に単語のペアを覚えてください。</div>
          <div>{learningTimeSeconds}秒経過すると次のペアが表示されます。</div>
          <div>
            全部で{pairs.length}
            個のペアが表示されますので、すべて覚えてください。
          </div>
          <div>
            全部のペアの表示が終わったら、一方の単語とペアになった単語を入力してもらいます。
          </div>
          <button onClick={props.startToLearn}>学習を始める</button>
        </>
      )}
    </div>
  );
}

function Answer(props: {
  state: Answer;
  changeAnswer: ChangeAnswer;
  confirmAnswer: ConfirmAnswer;
}) {
  const onChangeAnswer = (event: React.ChangeEvent<HTMLInputElement>) =>
    props.changeAnswer(event.target.value);
  return (
    <div>
      <div>{props.state.numberOfTry}回目の学習</div>
      <div>
        {pairs.length}ペア中{props.state.indexOfPair + 1}ペア目
      </div>
      <div>ペアの単語を入力してください。</div>
      <div>
        {pairs[props.state.indexOfPair].question}、
        <input
          type="text"
          value={props.state.answer}
          onChange={onChangeAnswer}
        />
      </div>
      <button onClick={props.confirmAnswer}>答えを確定する</button>
    </div>
  );
}

function Intermediate(props: {
  state: Intermediate;
  goToNextPhase: GoToNextPhase;
}) {
  return (
    <div>
      <div>{props.state.numberOfTry}回目の学習</div>
      <div>
        {pairs.length}ペア中、{props.state.numberOfCorrectAnswers}ペア正解です。
      </div>
      <button onClick={props.goToNextPhase}>再度学習を始める</button>
    </div>
  );
}

function Result(props: { state: Result; goToNextPhase: GoToNextPhase }) {
  return (
    <div>
      <div>
        {props.state.numberOfTry}回目の学習で全{pairs.length}
        ペア正解しました。
      </div>
      <button onClick={props.goToNextPhase}>すべてをやり直す</button>
    </div>
  );
}

export default App;
