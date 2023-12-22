
import "./Leaderboard.css";
import { Community } from '../../interfaces';
import { motion } from 'framer-motion';

interface LeaderboardProps {
    communitiesRanked: Community[]; //Array of Community objects in total points ranked order
}


const CommunityLeaderboard: React.FC<LeaderboardProps> = ({  communitiesRanked }) => {



    const fading_animation = {
        hidden: { opacity: 0, scale: 0.9, y: 10 },
        visible: { opacity: 1,  scale: 1, y: 0 },
      };

    let rank = 1;


    return (<div>



        <div id="leaderboard-wrapper">

            <div id="category-bar">
                <div id="rank-title" className={`category-title light-category-title`}>Rank</div>
                <div id="community-title" className={`category-title light-category-title`}>Community</div>
                <div id="members-title" className={`category-title light-category-title`}>Members</div>
                <div id="EXP-title" className={`category-title light-category-title`}>EXP</div>
            </div>



            {communitiesRanked.map((obj, index) => {
     

                return (
                    <motion.div key={index}
                    initial="hidden" animate="visible" variants={fading_animation}
                    transition={{ duration: 1.5, delay: index * 0.3 }}
                    className="motion-div light-motion-div">
                      <div key={obj._id} className={"leaderboard-unit"}>
                        <div id="rank" className="leaderboard-section light-leaderboard-section">{rank++}</div>
                        <img id="logo" className="leaderboard-section light-leaderboard-section" src={obj.logo} />
                        <div id="community" className="leaderboard-section light-leaderboard-section">{obj.name}</div>
                        <div id="members" className="leaderboard-section light-leaderboard-section">{obj.numberOfMembers}</div>
                        <div id="EXP" className="leaderboard-section light-leaderboard-section">{obj.totalPoints}</div>

                    </div>
                  </motion.div>
            
                )
            }





            )}


        </div>

    </div>

    );
};

export default CommunityLeaderboard;
