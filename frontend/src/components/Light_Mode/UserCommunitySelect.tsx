
import { Community, User } from '../../interfaces';
import React, { Dispatch, SetStateAction } from 'react';
import "./UserCommunitySelect.css";


interface UserCommunitySelectProps {
    handle_join_click: () => void;
    handle_leave_click: () => void;
    set_user: Dispatch<SetStateAction<string | null>>;
    set_community: Dispatch<SetStateAction<string | null>>;
    communities: Community[];
    users: User[];
}




const UserCommunitySelect: React.FC<UserCommunitySelectProps> = ({ handle_join_click, handle_leave_click, set_community, set_user, communities, users }) => {



    return (
        <div id="options-container" className="options-container" key="options-container">
            <label>
                User: &nbsp;
                <select className="select" onChange={(e) => set_user(e.target.value)}>
                    <option value="">Select User</option>
                    {users.map((user: User) => <option key={user._id} value={user._id}>{user.email}</option>)}
                </select>
            </label>

            <label>
                Community: &nbsp;
                <select className="select" onChange={(e) => set_community(e.target.value)}>
                    <option value="">Select Community</option>
                    {communities.map((community: Community) => <option key={community._id} value={community._id}>{community.name}</option>)}
                </select>
            </label>

            <div id="button-container">
                <button
                    id="join-button"
                    className="join-button"
                    onClick={handle_join_click}

                >
                    Join
                </button>

                <button
                    id="leave-button"
                    className="leave-button"
                    onClick={handle_leave_click}
                >
                    Leave
                </button>
            </div>
        </div>
    )


};

export default UserCommunitySelect;