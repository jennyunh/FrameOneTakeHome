import React, { useState, MouseEvent } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { Community, User } from '../../interfaces';
import "./DarkUserCommunityRelationshipManager.css";
import { toast } from 'react-hot-toast';
import MemoizedDarkLeaderboard from './DarkLeaderboard';
import ConfirmJoin from '../ConfirmJoin';
import ConfirmLeave from '../ConfirmLeave';
import DarkUserCommunitySelect from './DarkUserCommunitySelect';
import FrameOneLogo from '../FrameOneLogo';
import MemoizedMonthSelect from './MonthSelect';



interface MutationData {
    userId: string;
    communityId: string;
}


interface ManagerProps {
    toggle: boolean | null;
}


const DarkUserCommunityRelationshipManager: React.FC<ManagerProps> = ({ toggle }) => {



    //Selected user or community from drop down menu
    const [selectedUser, setSelectedUser] = useState<string | null>(null);
    const [selectedCommunity, setSelectedCommunity] = useState<string | null>(null);

    //State for if we want user to confirm joining a community
    const [confirmJoin, setConfirmJoin] = useState<boolean>(false);

    //State for if we want user to confirm leaving a community
    const [confirmLeave, setConfirmLeave] = useState<boolean>(false);


    //State for selecting month to sort by
    const [selectedMonth, setMonth] = useState<number>(0);

    //State for applying the month sort
    const [applyMonth, setApplyMonth] = useState<boolean>(false);


    //State for displaying month
    const [monthName, setMonthName] = useState<string>("No Month Selected");

    //State for displaying year
    const [yearName, setYearName] = useState<string>(new Date().getFullYear().toString());


    //State for selecting month to sort by
    const [leaderboardData, setLeaderboardData] = useState<Community[] | null>(null);






    //GET the data

    //get users
    const { data: users, isLoading: usersLoading, refetch: refetchUsers } = useQuery({
        queryKey: ['users'],
        queryFn: () => axios.get('http://localhost:8080/user').then(res => res.data)
    });


    //get communities in alphabetical order
    const { data: communities, isLoading: communitiesLoading, refetch: refetchCommunities } = useQuery({
        queryKey: ['communities'],
        queryFn: () => axios.get('http://localhost:8080/community/alphabetical').then(res => res.data)
    });


    //ranked communities data is passed onto the leaderboard component
    const { data: communitiesRanked, isLoading: communitiesRankedLoading, refetch: refetchCommunitiesRanked } = useQuery({
        queryKey: ['communitiesRanked'],
        queryFn: async () => {
            const res = await axios.get('http://localhost:8080/community/ranked');
            setLeaderboardData(res.data); // Set the state here
            return res.data;
        },
    });


    // ranked BY MONTH communities data is passed onto leaderboard component
    const { data: communitiesByMonth, isLoading: communitiesByMonthLoading, refetch: refetchCommunitiesByMonth } = useQuery({
        queryKey: ['communitiesByMonth'],
        queryFn: async () => {

            //if selectedMonth is 0 ("no month is selected"),
            //make leaderboard display all communities with their total points for all months
            if (selectedMonth === 0) {
                setLeaderboardData(communitiesRanked)
                setApplyMonth(false);

                console.log("selectedmonth is 0.  " + selectedMonth)

                //query function should return a promise
                return Promise.resolve([])
            }

            else {
                const res = await axios.get(`http://localhost:8080/community/bymonth?month=${selectedMonth}`);
                setApplyMonth(false);
                setLeaderboardData(res.data);
                console.log(res.data)
                return res.data;
            }

        },

        //  initial (empty array) data that you want available immediately (initial render)
        //and then fetch data if applyMonth state is true.
        //this will prevent the page from appearing to "refresh" after the apply button
        //is clicked for the first time.
        //It refreshed because it is creating this data for the first time.
        initialData: [],

        // Only get data when selectedMonth is truthy
        enabled: !!applyMonth,
    });






    //Mutation Functions
    const joinMutation = useMutation({
        mutationFn: (data: MutationData) => axios.post(`http://localhost:8080/user/${data.userId}/join/${data.communityId}`),
        onSuccess: () => {

            //REFETCH THE DATA UPON COMPLETION SO THAT
            //THE USER CAN'T CREATE DUPLICATES IN THE DATABASE with multiple button clicks
            refetchUsers();
            refetchCommunities();
            refetchCommunitiesRanked();

            toast.success('Successfully joined the community')
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onError: (error: any) => {
            toast.error(`Error: ${error.message}`);
        }
    });


    const leaveMutation = useMutation({
        mutationFn: (data: MutationData) => axios.delete(`http://localhost:8080/user/${data.userId}/leave/${data.communityId}`),
        onSuccess: () => {
            toast.success('Successfully left the community');


            //REFETCH THE DATA UPON COMPLETION SO THAT THE USER CAN'T CREATE DUPLICATES IN THE DATABASE
            refetchUsers();
            refetchCommunities();
            refetchCommunitiesRanked();


        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onError: (error: any) => {
            toast.error(`Error: ${error.message}`);
        }
    });







    //Handlers



    const handleJoinClick = (e: MouseEvent<HTMLButtonElement>) => {

        e.preventDefault();

        //if a user and community is selected
        if (selectedUser && selectedCommunity) {


            //find the selected user and community in the data
            const theSelectedUser = users.find((user: User) => user._id === selectedUser)
            const theSelectedCommunity = communities.find((community: Community) => community._id === selectedCommunity)


            //check if the selected user already has a community. 

            //if the selected user has a community, and it is the same as the selected community,
            //throw an error "You are already a member of this community"
            if (theSelectedUser && theSelectedUser.communityId === theSelectedCommunity._id) {
                toast.error("You are already a member of this community")
            }


            //else if the user has a community that's not the same as the selected community,
            //prompt a join confirmation popup:
            //"You can join only one community at a time. Would you like to leave your community and join the selected community?""
            else if (theSelectedUser && theSelectedUser.communityId) {
                setConfirmJoin(true);
            }

            //else if user doesn't have a community, join the selected community
            else {
                joinMutation.mutate({ userId: selectedUser, communityId: selectedCommunity })
            }

        }

        else {
            toast.error("Please select a user and a community")
        }

    }







    const handleConfirmJoin = (confirmed: boolean) => {

        //When user confirms, join the community
        if (confirmed && selectedUser && selectedCommunity) {

            console.log("confirm the join: " + selectedUser + " and " + selectedCommunity)
            joinMutation.mutate({ userId: selectedUser, communityId: selectedCommunity })
        }

        //Get rid of confirmation popup
        setConfirmJoin(false);
    }



    



    const handleLeaveClick = (e: MouseEvent<HTMLButtonElement>) => {

        e.preventDefault();

        if (selectedUser && selectedCommunity) {

            //find the selected user and community in the data
            const theSelectedUser = users.find((user: User) => user._id === selectedUser)
            const theSelectedCommunity = communities.find((community: Community) => community._id === selectedCommunity)
            const users_community = communities.find((community: Community) => community._id === theSelectedUser.communityId)

            //check if the user has a community to leave. If not, show error popup
            if (!theSelectedUser.communityId) {
                toast.error("You do not have a community to leave. Please join a community.")
            }

            //Else if the selected community is NOT the same as the community the user joined,
            //throw error
            else if (theSelectedCommunity._id !== theSelectedUser.communityId) {
                toast.error("This is not the community you joined\n You are a member of: " + users_community.name)
            }

            //else prompt a leave confirmation popup
            //***If they leave, they will lose any experience points they collected for that community.
            //My assumption: the total points of a given community
            //is the total points accrued by its ACTIVE members (so any points accrued by EX-members will be deleted)
            else {
                setConfirmLeave(true);
            }
        }

        else {
            toast.error("Please select a user and a community")
        }
    }





    const handleConfirmLeave = (confirmed: boolean) => {

        if (confirmed && selectedUser && selectedCommunity) {
            leaveMutation.mutate({ userId: selectedUser, communityId: selectedCommunity })
        }

        setConfirmLeave(false);
    }





    if (usersLoading || communitiesLoading || communitiesRankedLoading || communitiesByMonthLoading) return 'Loading...';



    return (

        <div id="dark-wrapper">
            <FrameOneLogo toggle={toggle} />


            <DarkUserCommunitySelect
                set_user={setSelectedUser}
                set_community={setSelectedCommunity}
                handle_join_click={handleJoinClick}
                handle_leave_click={handleLeaveClick}
                communities={communities}
                users={users} />

            <div id="month-name"><div id="month-title">Month:&nbsp; </div> {monthName}

                &nbsp; &nbsp; &nbsp;

                <div id="month-title">Year:&nbsp; </div>
                {yearName}


            </div>

            <MemoizedMonthSelect setMonth={setMonth} setYearName={setYearName} setMonthName={setMonthName} setApplyMonth={setApplyMonth} />


            <MemoizedDarkLeaderboard data={leaderboardData} />

            {confirmJoin && (
                <ConfirmJoin handle_join={handleConfirmJoin} />
            )}

            {confirmLeave && (
                <ConfirmLeave handle_leave={handleConfirmLeave} />
            )}

        </div>

    );


};

export default DarkUserCommunityRelationshipManager;