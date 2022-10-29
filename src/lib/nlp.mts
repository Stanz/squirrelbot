import nlp from "compromise";
import nlpDates from "compromise-dates";
import nlpNumbers from "compromise-numbers";
const nlpEx = (nlp as any).extend(nlpDates).extend(nlpNumbers);

export default nlpEx;
