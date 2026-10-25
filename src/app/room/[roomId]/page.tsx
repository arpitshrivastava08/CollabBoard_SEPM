import BoardRoom from "@/components/BoardRoom";

export default function RoomPage({ params }: { params: { roomId: string } }) {
  return <BoardRoom roomId={params.roomId} />;
}
