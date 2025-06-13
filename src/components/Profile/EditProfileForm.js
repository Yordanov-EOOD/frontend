import React, { useState } from "react";
import TextareaAutosize from "react-textarea-autosize";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import useInput from "../../hooks/useInput";
import Input from "../Input";
import Button from "../../styles/Button";
import Form from "../../styles/Form";
import { displayError } from "../../utils";
import CoverPhoto from "../../styles/CoverPhoto";
import Avatar from "../../styles/Avatar";
import { uploadImage } from "../../utils";
import { editProfile } from "../../queries/profile";
import { useAuth } from "../../context/AuthContext";

const EditProfileForm = ({ profile }) => {
  const [avatarState, setAvatar] = useState("");
  const [coverPhotoState, setCoverPhoto] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  console.log("EditProfileForm: Received profile:", profile);

  // Use proper field mapping with fallbacks
  const name = useInput(profile?.firstname || profile?.username || profile?.fullname || profile?.displayName || "");
  const bio = useInput(profile?.bio || "");
  const avatar = useInput(profile?.avatar || profile?.image || "");
  const coverPhoto = useInput(profile?.coverPhoto || "");
  const location = useInput(profile?.location || "");
  const website = useInput(profile?.website || "");
  const email = useInput(profile?.email || "");

  const handle = profile?.handle || profile?.username || profile?.id;

  const handleEditProfile = async (e) => {
    e.preventDefault();

    if (!name.value) {
      return toast.error("You cannot leave name empty");
    }

    const userAuthId = currentUser?.id || currentUser?.authUserId;
    if (!userAuthId) {
      return toast.error("User authentication required");
    }

    setLoading(true);
    try {
      const updateData = {
        name: name.value,
        bio: bio.value,
        avatar: avatarState ? avatarState : avatar.value,
        coverPhoto: coverPhotoState ? coverPhotoState : coverPhoto.value,
        location: location.value,
        website: website.value,
        email: email.value,
      };
      
      console.log("EditProfileForm: Submitting update data:", updateData);
      console.log("EditProfileForm: Using userAuthId:", userAuthId);

      await editProfile(updateData, userAuthId);

      toast.success("Your profile has been updated 🥳");
    } catch (err) {
      console.error("EditProfileForm: Error updating profile:", err);
      setLoading(false);
      return displayError(err);
    }
    setLoading(false);
    [
      name,
      bio,
      avatar,
      coverPhoto,
      location,
      website,
      email,
    ].map((field) => field.setValue(""));

    // Navigate to user profile using the current user's auth ID
    navigate(`/user/${userAuthId}`);
  };

  const handleCoverPhoto = async (e) => {
    setCoverPhoto(await uploadImage(e.target.files[0]));
  };

  const handleAvatar = async (e) => {
    setAvatar(await uploadImage(e.target.files[0]));
  };

  return (
    <Form lg onSubmit={handleEditProfile}>
      <div className="cover-photo">
        <label htmlFor="cover-photo-input">
          <CoverPhoto
            src={coverPhotoState ? coverPhotoState : coverPhoto.value}
            alt="cover"
          />
        </label>
        <input type="file" id="cover-photo-input" accept="image/*" onChange={handleCoverPhoto} />
      </div>

      <div className="avatar-input">
        <label htmlFor="avatar-input-file">
          <Avatar
            lg
            src={avatarState ? avatarState : avatar.value}
            alt="avatar"
          />
        </label>
        <input type="file" accept="image/*" id="avatar-input-file" onChange={handleAvatar} />
      </div>

      <Input
        lg={true}
        text="Name"
        value={name.value}
        onChange={name.onChange}
      />

      <Input
        lg={true}
        text="Email"
        type="email"
        value={email.value}
        onChange={email.onChange}
      />

      <Input
        lg={true}
        text="Location"
        value={location.value}
        onChange={location.onChange}
      />

      <Input
        lg={true}
        text="Website"
        type="url"
        value={website.value}
        onChange={website.onChange}
      />
      
      <div className="bio-input">
        <label htmlFor="bio-textarea">Bio</label>
        <TextareaAutosize
          id="bio-textarea"
          placeholder="Tell us about yourself..."
          value={bio.value}
          onChange={bio.onChange}
          minRows={3}
          maxRows={6}
          style={{
            width: '100%',
            padding: '12px',
            border: '1px solid #ccc',
            borderRadius: '8px',
            fontSize: '16px',
            fontFamily: 'inherit',
            resize: 'none',
            marginTop: '8px'
          }}
        />
      </div>

      <Button outline disabled={loading} type="submit">
        {loading ? "Saving" : "Save"}
      </Button>
    </Form>
  );
};

export default EditProfileForm;
