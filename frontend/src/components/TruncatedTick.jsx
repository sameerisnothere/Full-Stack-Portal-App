const TruncatedTick = ({ x, y, payload, colors }) => {
  const maxLength = 15; // Set the maximum characters to display
  const name = payload.value.length > maxLength 
    ? `${payload.value.substring(0, maxLength)}...` 
    : payload.value;

  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={0}
        y={0}
        dy={16}
        textAnchor="middle"
        fill={colors.grey[100]}
        fontSize="12px"
      >
        {name}
      </text>
    </g>
  );
};

export default TruncatedTick;