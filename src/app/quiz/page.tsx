import QuizGame from "@/components/QuizGame";

export const metadata = { title: "შერეული ქვიზი · Wivilo" };

export default function MixedQuizPage() {
  return <QuizGame quizKey="mixed" title="შერეული ქვიზი" back="/" count={12} />;
}
