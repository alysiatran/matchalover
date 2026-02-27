import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ChatRoom {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  room_id: string;
  user_id: string;
  content: string;
  created_at: string;
  author_name?: string;
}

export interface ChatRoomWithCount extends ChatRoom {
  member_count: number;
}

export function useChatRooms() {
  return useQuery({
    queryKey: ["chat-rooms"],
    queryFn: async (): Promise<ChatRoomWithCount[]> => {
      const { data: rooms, error } = await supabase
        .from("chat_rooms")
        .select("*")
        .order("created_at", { ascending: true });
      if (error) throw error;

      // Get distinct user counts per room
      const { data: messages } = await supabase
        .from("chat_messages")
        .select("room_id, user_id");

      const roomUserMap = new Map<string, Set<string>>();
      for (const msg of messages || []) {
        if (!roomUserMap.has(msg.room_id)) roomUserMap.set(msg.room_id, new Set());
        roomUserMap.get(msg.room_id)!.add(msg.user_id);
      }

      return (rooms || []).map((r) => ({
        ...r,
        member_count: roomUserMap.get(r.id)?.size || 0,
      }));
    },
  });
}

export function useChatMessages(roomId: string | null) {
  const qc = useQueryClient();

  // Realtime subscription
  useEffect(() => {
    if (!roomId) return;

    const channel = supabase
      .channel(`chat-${roomId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `room_id=eq.${roomId}`,
        },
        () => {
          qc.invalidateQueries({ queryKey: ["chat-messages", roomId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId, qc]);

  return useQuery({
    queryKey: ["chat-messages", roomId],
    enabled: !!roomId,
    refetchInterval: false,
    queryFn: async (): Promise<ChatMessage[]> => {
      const { data, error } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("room_id", roomId!)
        .order("created_at", { ascending: true })
        .limit(100);
      if (error) throw error;

      // Resolve author names
      const userIds = [...new Set((data || []).map((m) => m.user_id))];
      if (userIds.length === 0) return [];

      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, display_name")
        .in("user_id", userIds);

      const profileMap = new Map(
        (profiles || []).map((p) => [p.user_id, p.display_name || "Anonymous"])
      );

      return (data || []).map((m) => ({
        ...m,
        author_name: profileMap.get(m.user_id) || "Anonymous",
      }));
    },
  });
}

export async function sendChatMessage(roomId: string, userId: string, content: string) {
  const { error } = await supabase
    .from("chat_messages")
    .insert({ room_id: roomId, user_id: userId, content });
  if (error) throw error;
}
