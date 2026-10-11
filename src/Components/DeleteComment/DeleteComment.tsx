import { Button } from "@heroui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import toast from "react-hot-toast";

const DeleteComment = ({
  postId,
  commentId,
}: {
  postId: string;
  commentId: string;
}) => {
  const queryClient = useQueryClient();

  function deleteComment() {
    return axios.delete(
      `https://route-posts.routemisr.com/posts/${postId}/comments/${commentId}`,
      {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      },
    );
  }

  const { isPending, mutate } = useMutation({
    mutationFn: deleteComment,

    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["comments", postId],
      });

      toast.success(data.data.message);
    },

    onError: (error) => {
      if (axios.isAxiosError(error)) {
        toast.error(
          error.response?.data?.message || "Failed to delete comment",
        );
      }
    },
  });

  return (
    <Button onClick={() => mutate()} variant="danger" isDisabled={isPending}>
      {isPending ? "Deleting..." : "Delete"}
    </Button>
  );
};

export default DeleteComment;
