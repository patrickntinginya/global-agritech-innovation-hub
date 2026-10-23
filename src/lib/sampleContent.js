// Whether the published site still contains seeded demonstration content. While it does, pages carry the
// "Demonstration content" labels. Once an administrator removes the sample rows the labels disappear by themselves,
// so real content is never labelled as a sample. Defaults to true until the database has answered.
let hasSample = true;
export const hasSampleContent = () => hasSample;
export const setHasSampleContent = (value) => { hasSample = Boolean(value); };
