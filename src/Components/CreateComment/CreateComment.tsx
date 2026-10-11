import { Button, Input } from "@heroui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useRef, useState } from "react";
import toast from "react-hot-toast";

const CreateComment = ({ id }: { id: string }) => {
  const queryClient = useQueryClient();

  const commentContent = useRef("");
  const commentImage = useRef("");

  const [imgSrc, setImgSrc] = useState(null);
  const [img, setImg] = useState(null);

  const { isPending, mutate } = useMutation({
    mutationFn: createComment,
    onSuccess: (data) => {
      toast.success(data.data.message);
      queryClient.invalidateQueries({
        queryKey: ["comments", id],
      });
      queryClient.invalidateQueries({
        queryKey: ["Posts"],
      });
      queryClient.invalidateQueries({
        queryKey: ["UserPost"],
      });

      closeImg();
      commentContent.current.value = "";
    },
    onError: (error) => {
      toast.error(error.response.data.message);
    },
  });

  function createComment() {
    const formData = new FormData();

    if (commentContent.current.value != "") {
      formData.append("content", commentContent.current.value);
    }

    if (img != null) {
      formData.append("image", img);
    }

    return axios.post(
      `https://route-posts.routemisr.com/posts/${id}/comments`,
      formData,
      {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      },
    );
  }

  function handleImg() {
    const url = URL.createObjectURL(commentImage.current.files[0]);

    setImgSrc(url);
    setImg(commentImage.current.files[0]);
  }

  function closeImg() {
    setImgSrc(null);
    commentImage.current = "";
  }

  return (
    <>
      <div className="bg-blue-100 my-5 p-6">
        <Input
          ref={commentContent}
          type="text"
          fullWidth={true}
          placeholder="Enter your comment"
        />

        {imgSrc ? (
          <div className="my-5">
            <i
              onClick={closeImg}
              className="fa-solid fa-xmark cursor-pointer"
            ></i>
            <img src={imgSrc} className="w-1/2" alt="" />
          </div>
        ) : (
          <Input
            onChange={handleImg}
            ref={commentImage}
            type="file"
            className="my-4"
          />
        )}

        <Button onClick={mutate} variant="primary" className="block">
          {isPending ? (
            <i className="fa-solid fa-spinner fa-spin text-white"></i>
          ) : (
            "Create Comment"
          )}
        </Button>
      </div>
    </>
  );
};

export default CreateComment;
