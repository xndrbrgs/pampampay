interface ConnectUserProfileProps {
  username: string;
  customId: string;
  img: string | null;
}

const ConnectUserProfile = ({
  username,
  img,
  customId,
}: ConnectUserProfileProps) => {
  return (
    <div className="">
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
          {img ? (
            <img
              src={img}
              alt="Profile picture"
              className="w-8 h-8 rounded-full"
            />
          ) : (
            <span className="text-gray-500 text-xs">
              {username[0].toUpperCase()}
            </span>
          )}
        </div>
        <div>
          <div className="text-sm font-medium text-gray-300">{username}</div>
          <div className="text-xs text-gray-500">{customId}</div>
        </div>
      </div>
    </div>
  );
};

export default ConnectUserProfile;