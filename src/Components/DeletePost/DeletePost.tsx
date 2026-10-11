import { Button } from "@heroui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import toast from "react-hot-toast";

const DeletePost = ({ id }: { id: string }) => {
  const queryClient = useQueryClient();

  function deletePost() {
    return axios.delete(`https://route-posts.routemisr.com/posts/${id}`, {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
    });
  }

  const { isPending, mutate } = useMutation({
    mutationFn: deletePost,
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["Posts"],
      });

      queryClient.invalidateQueries({
        queryKey: ["UserPost"],
      });

      toast.success(data.data.message);
    },
    onError: (error) => {
      toast.error(error.response.data.message);
    },
  });

  return (
    <>
      <Button onClick={mutate} variant="danger">
        Delete
      </Button>
    </>
  );
};

export default DeletePost;
