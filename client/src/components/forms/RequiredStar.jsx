/** Visual marker for required fields (matches FormInput / FormSelect). */
export default function RequiredStar() {
  return (
    <span className="text-red-500" aria-hidden="true">
      {' *'}
    </span>
  );
}
