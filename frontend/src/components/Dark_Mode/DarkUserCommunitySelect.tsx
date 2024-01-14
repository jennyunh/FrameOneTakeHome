
import { Community, User } from '../../interfaces';
import React, { Dispatch, SetStateAction, MouseEvent} from 'react';
import "./DarkUserCommunitySelect.css";


interface UserCommunitySelectProps {
    handle_join_click: (e: MouseEvent<HTMLButtonElement>)  => void;
    handle_leave_click: (e: MouseEvent<HTMLButtonElement>)  => void;
    set_user: Dispatch<SetStateAction<string | null>>;
    set_community: Dispatch<SetStateAction<string | null>>;
    communities: Community[];
    users: User[];
}




const DarkUserCommunitySelect: React.FC<UserCommunitySelectProps> = ({ handle_join_click, handle_leave_click, set_community, set_user, communities, users }) => {



    return (
        <div id="dark-options-container" className="options-container" key="options-container">
            <label className="dark-label">
                User: &nbsp;
                <select className="dark-select" onChange={(e) => set_user(e.target.value)}>
                    <option value="">Select User</option>
                    {users.map((user: User) => <option key={user._id} value={user._id}>{user.email}</option>)}
                </select>
            </label>

            <label className="dark-label">
                Community: &nbsp;
                <select className="dark-select" onChange={(e) => set_community(e.target.value)}>
                    <option value="">Select Community</option>
                    {communities.map((community: Community) => <option key={community._id} value={community._id}>{community.name}</option>)}
                </select>
            </label>

            <div id="button-container">
                <button
                    id="dark-join-button"
                    className="join-button"
                    onClick={(e) => {handle_join_click(e)}}

                >
                    Join
                </button>

                <button
                    id="dark-leave-button"
                    className="leave-button"
                    onClick={(e) => {handle_leave_click(e)}}
                >
                    Leave
                </button>
            </div>
        </div>
    )


};


export default DarkUserCommunitySelect;
