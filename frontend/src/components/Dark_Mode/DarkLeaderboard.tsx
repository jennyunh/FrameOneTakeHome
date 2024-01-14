
import "./DarkLeaderboard.css";
import { Community } from '../../interfaces';
import { motion } from 'framer-motion';
import React from 'react';

interface LeaderboardProps {
    data: Community[] | null; //Array of Community objects in total points ranked order
}


const DarkLeaderboard: React.FC<LeaderboardProps> = ({ data }) => {

    const fading_animation = {
        hidden: { opacity: 0, scale: 0.9, y: 10 },
        visible: { opacity: 1, scale: 1, y: 0 },
    };

    let rank = 1;


    return (<div>



        <div id="leaderboard-wrapper">

            <div id="dark-category-bar">
                <div id="rank-title" className={`category-title dark-category-title`}>Rank</div>
                <div id="community-title" className={`category-title dark-category-title`}>Community</div>
                <div id="members-title" className={`category-title dark-category-title`}>Members</div>
                <div id="EXP-title" className={`category-title dark-category-title`}>EXP</div>
            </div>



            {data?.map((obj, index) => {


                return (
                    <motion.div key={index}
                        initial="hidden" animate="visible" variants={fading_animation}
                        transition={{ duration: 1.5, delay: index * 0.3 }}
                        className="motion-div dark-motion-div">
                        <div key={obj._id} className={"leaderboard-unit"}>
                            <div id="dark-rank" className="leaderboard-section dark-leaderboard-section">{rank++}</div>
                            <img id="dark-logo" className="leaderboard-section dark-leaderboard-section" src={obj.logo} />
                            <div id="dark-community" className="leaderboard-section dark-leaderboard-section">{obj.name}</div>
                            <div id="dark-members" className="leaderboard-section dark-leaderboard-section">{obj.totalMembers}</div>
                            <div id="dark-EXP" className="leaderboard-section dark-leaderboard-section">{obj.totalPoints}</div>

                        </div>
                    </motion.div>

                )
            }





            )}


        </div>

    </div>

    );
};

// Memoize the component to prevent unnecessary renders
const MemoizedDarkLeaderboard = React.memo(DarkLeaderboard);


export default MemoizedDarkLeaderboard;
