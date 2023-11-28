export default function CustomError({ statusCode }) {
  return (
    <div>
      <h1>Error</h1>
      <p>
        {statusCode
          ? `An error ${statusCode} occurred on server`
          : 'An error occurred on client'}
      </p>
    </div>
  );
}