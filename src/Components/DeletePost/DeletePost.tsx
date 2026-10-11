import { Button } from "@heroui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import toast from "react-hot-toast";

const DeletePost = ({ id }: { id: string }) => {
  const queryClient = useQueryClient();

  const { isPending, mutate } = useMutation({
    mutationFn: () =>
      axios.delete(`https://route-posts.routemisr.com/posts/${id}`, {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      }),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["Posts"] });
      queryClient.invalidateQueries({ queryKey: ["UserPost"] });
      toast.success(res.data?.message ?? "Post deleted");
    },
    onError: (e) =>
      toast.error(
        axios.isAxiosError(e)
          ? (e.response?.data?.message ?? "Delete failed")
          : "Delete failed",
      ),
  });

  return (
    <Button isDisabled={isPending} onClick={() => mutate()} variant="danger">
      Delete
    </Button>
  );
};

export default DeletePost;