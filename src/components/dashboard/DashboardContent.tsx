import CourseList from "./CourseList";
import CartList from "./CartList";
import SelectedList from "./SelectedList";
import EmptyState from "../common/EmptyState";

interface DashboardContentProps {
  view: "list" | "selected" | "cart";
  filteredCourses: any[];
  cart: any[];
  addToCart: (course: any) => void;
  expandedGroupId: string | null;
  toggleGroup: (id: string) => void;
  removeFromCart: (courseId: string) => void;
  isGrabbing: boolean;
  toggleGrab: () => void;
  selectedCourses: any[];
  onDrop: (course: any) => void;
}

export default function DashboardContent({
  view,
  filteredCourses,
  cart,
  addToCart,
  expandedGroupId,
  toggleGroup,
  removeFromCart,
  isGrabbing,
  toggleGrab,
  selectedCourses,
  onDrop,
}: DashboardContentProps) {
  return (
    <div className="flex-1 overflow-y-auto p-4 bg-gray-50/50">
      {view === "list" ? (
        filteredCourses.length > 0 ? (
          <CourseList
            filteredCourses={filteredCourses}
            cart={cart}
            addToCart={addToCart}
            expandedGroupId={expandedGroupId}
            toggleGroup={toggleGroup}
          />
        ) : (
          <EmptyState view="list" />
        )
      ) : view === "cart" ? (
        <CartList
          cart={cart}
          removeFromCart={removeFromCart}
          isGrabbing={isGrabbing}
          toggleGrab={toggleGrab}
        />
      ) : selectedCourses.length > 0 ? (
        <SelectedList selectedCourses={selectedCourses} onDrop={onDrop} />
      ) : (
        <EmptyState view="selected" />
      )}
    </div>
  );
}
