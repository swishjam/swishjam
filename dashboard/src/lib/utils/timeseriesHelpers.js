const dateFormatterForGrouping = grouping => {
  switch (grouping) {
    case 'month':
      return date => new Date(date).toLocaleString("default", { month: "long" });
    case 'week':
      return date => `Week of ${new Date(date).toLocaleString("default", { day: "numeric", month: "short" })}`;
    case 'day':
      return date => new Date(date).toLocaleString("default", { day: "numeric", month: "short" });
    case 'hour', 'minute':
      return date => new Date(date).toLocaleString("default", { hour: "numeric", minute: "numeric", day: 'numeric', month: 'short' });
    default:
      return date => new Date(date).toLocaleString("default", { day: "numeric", month: "short" });
  }
}

export { dateFormatterForGrouping }