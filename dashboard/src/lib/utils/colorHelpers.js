const generateUniqueHexColor = () => {
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += Math.floor(Math.random() * 16).toString(16);
  }
  return color;
}

const COLORS = [
  '#1F77B4', // - Muted Blue
  '#AEC7E8', // - Light Blue
  '#FF7F0E', // - Safety Orange
  '#FFBB78', // - Light Orange
  '#2CA02C', // - Cooked Asparagus Green
  '#98DF8A', // - Light Green
  '#D62728', // - Brick Red
  '#FF9896', // - Light Red
  '#9467BD', // - Muted Purple
  '#C5B0D5', // - Light Purple
  '#8C564B', // - Chestnut Brown
  '#C49C94', // - Light Brown
  '#E377C2', // - Raspberry Yogurt Pink
  '#F7B6D2', // - Light Pink
  '#7F7F7F', // - Middle Gray
  '#C7C7C7', // - Silver
  '#BCBD22', // - Muted Lime Green
  '#DBDB8D', // - Light Lime Green
  '#17BECF', // - Blue-Teal
  '#9EDAE5'  // - Light Blue-Teal
];

// const COLORS = [
//   '#FF0000', // - Bright Red
//   '#00FF00', // - Bright Green
//   '#0000FF', // - Bright Blue
//   '#FFFF00', // - Yellow
//   '#FF00FF', // - Magenta
//   '#00FFFF', // - Cyan
//   '#FF6600', // - Orange
//   '#6600FF', // - Purple
//   '#006600', // - Dark Green
//   '#FF0066', // - Pink
//   '#6666FF', // - Light Blue
//   '#FFCC00', // - Gold
//   '#CC00FF', // - Violet
//   '#00CCFF', // - Sky Blue
//   '#FF9900', // - Amber
//   '#009999', // - Teal
//   '#9933FF', // - Lavender
//   '#FF6699', // - Rose
//   '#3366FF', // - Azure
//   '#CC9900', // - Bronze
//   '#9900CC', // - Indigo
//   '#66FFCC', // - Aquamarine
//   '#CC3366', // - Maroon
//   '#0099FF', // - Capri
//   '#FFCC66', // - Peach
//   '#006699', // - Slate Blue
// ]



export { generateUniqueHexColor, COLORS }