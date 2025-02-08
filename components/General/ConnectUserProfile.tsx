interface ConnectUserProfileProps {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  img: string | null;
}

const ConnectUserProfile = ({
  firstName,
  lastName,
  username,
  email,
  img,
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
              {firstName && lastName
                ? `${firstName[0].toUpperCase()}${lastName[0].toUpperCase()}`
                : username[0].toUpperCase()}
            </span>
          )}
        </div>
        <div>
            <div className="text-sm font-medium text-gray-300">
            {firstName && lastName ? `${firstName} ${lastName}` : username}
            </div>
          <div className="text-xs text-gray-500">{email}</div>
        </div>
      </div>
    </div>
  );
};

export default ConnectUserProfile;
