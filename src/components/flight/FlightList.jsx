import {
  DndContext,
  closestCenter,
} from "@dnd-kit/core";

import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";

import SortableFlightCard from "./SortableFlightCard";

export default function FlightList({
  flights = [],
  readonly,
  onEdit,
  onDelete,
  onReorder,
}) {

  const list = Array.isArray(flights)
    ? flights
    : flights
    ? [flights]
    : [];

  function getId(item, index) {
    return item.id || `flight-${index}`;
  }

  function handleDragEnd(event) {

    const { active, over } = event;

    if (!over) return;

    if (active.id === over.id) return;

    const oldIndex = list.findIndex(
      (item, index) => getId(item, index) === active.id
    );

    const newIndex = list.findIndex(
      (item, index) => getId(item, index) === over.id
    );

    if (oldIndex === -1 || newIndex === -1) return;

    onReorder(
      arrayMove(list, oldIndex, newIndex)
    );

  }

  return (

    <DndContext
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >

      <SortableContext
        items={list.map((item, index) => getId(item, index))}
        strategy={verticalListSortingStrategy}
      >

        {list.map((segment, index) => (

          <SortableFlightCard
            key={getId(segment, index)}
            segment={segment}
            index={index}
            readonly={readonly}
            onEdit={onEdit}
            onDelete={onDelete}
          />

        ))}

      </SortableContext>

    </DndContext>

  );

}