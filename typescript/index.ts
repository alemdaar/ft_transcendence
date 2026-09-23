"use strict"
const learnerName: string = "Oussama";
const lessonNumber: number = 1;
const isLearning: boolean = true;

function describeLesson(name: string, number: number): string {
	return `${name} is starting TypeScript lesson ${number}.`;
}

const lesson = {
	title: "Types",
	completed: false,
};

console.log(describeLesson(learnerName, lessonNumber));
console.log(`Learning: ${isLearning}`);
console.log(lesson);

const ids: number[] = [1, 2, 3];
const names = ["oussama", "ahmed", "sara"];
