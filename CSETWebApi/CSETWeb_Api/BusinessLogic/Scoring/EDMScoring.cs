﻿//////////////////////////////// 
// 
//   Copyright 2021 Battelle Energy Alliance, LLC  
// 
// 
//////////////////////////////// 
using DataLayerCore.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CSETWeb_Api.BusinessLogic.Scoring
{
    public class EDMScoring
    {
        ///trying to think of the best way to do this and am not coming up with a good way
        ///the brute force is a tree and then walk the tree and if any leaf node is incomplete 
        ///then everything up the line is incomplete if anything
        ///However if all nodes are NO or empty then the score is empty
        ///There are three types of nodes top level, mid tier, and leaf. 
        /// A leaf is just a leaf
        /// GREEN -Y, RED -N, YELLOW -Incomplete
        /// A mid tier is only Red if all it's leaves are red 
        /// a mid tier is only Green if all it's leaves are green
        /// a mid tier is Yellow if any other state exists
        /// a top level tier is only green if all its children are green
        /// a top level tier is yellow if all it's top level children are green and its direct children are not all read (ie anything is green or yellow)
        /// a top level tier is red if its top level child is yellow and 

        private Dictionary<String, ScoringNode> midNodes = new Dictionary<String, ScoringNode>();
        private Dictionary<int, LeafNode> leafNodes = new Dictionary<int, LeafNode>();
        private TopLevelScoreNode topNode; 
        public void SetAnswers(int assessment_id)
        {
            using (CSET_Context db = new CSET_Context())
            {
                //clean out the top nodes
                
                //then load the answers;
                var result = from a in db.ANSWER                             
                             where a.Assessment_Id == assessment_id && a.Question_Type == "Maturity"
                             select a;
                foreach (var a in result.ToList())
                {
                    LeafNode leaf;
                    if(leafNodes.TryGetValue(a.Question_Or_Requirement_Id, out leaf)){
                        leaf.Answer = a.Answer_Text;                        
                    }
                    else
                    {
                        //log that we missed the question
                    }
                    
                }
            }
        }
        
        public void LoadDataStructure()
        {
            this.topNode = staticLoadTree();
            //get the top level nodes
            //then add in all the children
            using (CSET_Context db = new CSET_Context())
            {
                var result = from a in db.MATURITY_QUESTIONS
                             join b in db.MATURITY_GROUPINGS on a.Grouping_Id equals b.Grouping_Id
                             where a.Maturity_Model_Id == 3                             
                             select new { a, b };
                Dictionary<int, string> questionIDtoTitle = new Dictionary<int, string>();
                foreach (var q in result.ToList())
                {
                    questionIDtoTitle.Add(q.a.Mat_Question_Id, q.a.Question_Title);
                    ScoringNode t = midNodes[q.b.Title_Id];
                    if (q.a.Parent_Question_Id == null)
                    {
                        LeafNode l = processLeafNode(q.a.Mat_Question_Id, q.a.Question_Title,t);
                        t.Children.Add(l);
                    }
                    else
                    {
                        //remove the parent question from leaves dictionary
                        //remove the parent question from it's parent's child collection
                        //add it to the children of t as new mid node
                        //then add all the children to this new mid node

                        //note that at this poing Parent_Question_Id should never be null
                        ScoringNode outNode;
                        string parentTitle = questionIDtoTitle[q.a.Parent_Question_Id ?? 0]; 
                        if (midNodes.TryGetValue(parentTitle, out outNode))
                        {
                            LeafNode l = processLeafNode(q.a.Mat_Question_Id, q.a.Question_Title,outNode);
                            outNode.Children.Add(l);                            
                        }
                        else
                        {
                            LeafNode parentLeaf = leafNodes[q.a.Parent_Question_Id ?? 0];
                            parentLeaf.Parent.Children.Remove(parentLeaf);
                            leafNodes.Remove(q.a.Parent_Question_Id ?? 0);
                            
                            MidlevelScoreNode node = new MidlevelScoreNode()
                            {
                                Title_Id = parentTitle,
                                Grouping_Id = q.a.Grouping_Id ?? 0,
                                Description = "Parent of "+ q.a.Question_Title
                            };
                            midNodes.Add(parentTitle, node);
                            LeafNode l = processLeafNode(q.a.Mat_Question_Id, q.a.Question_Title,node);
                            node.Children.Add(l);                            
                            t.Children.Add(node);
                        }
                    }
                }
            }
        }

        private LeafNode processLeafNode(int questionid, string title_id, ScoringNode t)
        {
            LeafNode l = new LeafNode()
            {
                Mat_Question_Id = questionid,
                Title_Id = title_id,
                Parent = t
            };
            leafNodes.Add(questionid, l);
            return l;
        }

        private TopLevelScoreNode staticLoadTree()
        {
            TopLevelScoreNode mil1 = new TopLevelScoreNode() { Title_Id = "MIL1", Description = "MIL1 - Performed" };
            midNodes.Add(mil1.Title_Id, mil1);            
            mil1.Children.Add(new MidlevelScoreNode() { Title_Id = "RF:G1", Description = "Goal 1 - Acquirer service and asset priorities are established." });
            mil1.Children.Add(new MidlevelScoreNode() { Title_Id = "RF:G2", Description = "Goal 2 - Forming relationships with external entities is planned." });
            mil1.Children.Add(new MidlevelScoreNode() { Title_Id = "RF:G3", Description = "Goal 3 – Risk management includes external dependencies." });
            mil1.Children.Add(new MidlevelScoreNode() { Title_Id = "RF:G4", Description = "Goal 4 - External entities are evaluated." });
            mil1.Children.Add(new MidlevelScoreNode() { Title_Id = "RF:G5", Description = "Goal 5 – Formal agreements include resilience requirements." });
            mil1.Children.Add(new MidlevelScoreNode() { Title_Id = "RF:G6", Description = "Goal 6 –Technology asset supply chain risks are managed." });
            mil1.Children.Add(new MidlevelScoreNode() { Title_Id = "RMG:G1", Description = "Goal 1 - External dependencies are identified and prioritized." });
            mil1.Children.Add(new MidlevelScoreNode() { Title_Id = "RMG:G2", Description = "Goal 2 - Supplier risk management is continuous." });
            mil1.Children.Add(new MidlevelScoreNode() { Title_Id = "RMG:G3", Description = "Goal 3 – Supplier performance is governed and managed." });
            mil1.Children.Add(new MidlevelScoreNode() { Title_Id = "RMG:G4", Description = "Goal 4 – Change and capacity management are applied to external dependencies." });
            mil1.Children.Add(new MidlevelScoreNode() { Title_Id = "RMG:G5", Description = "Goal 5 – Supplier transitions are managed." });
            mil1.Children.Add(new MidlevelScoreNode() { Title_Id = "RMG:G6", Description = "Goal 6 – Infrastructure and governmental dependencies are managed." });
            mil1.Children.Add(new MidlevelScoreNode() { Title_Id = "RMG:G7", Description = "Goal 7 – External entity access to acquirer assets is managed." });
            mil1.Children.Add(new MidlevelScoreNode() { Title_Id = "SPS:G1", Description = "Goal 1 - Disruption planning includes external dependencies." });
            mil1.Children.Add(new MidlevelScoreNode() { Title_Id = "SPS:G2", Description = "Goal 2 - Planning and controls are maintained and updated." });
            mil1.Children.Add(new MidlevelScoreNode() { Title_Id = "SPS:G3", Description = "Goal 3 – Situational awareness extends to external dependencies." }); foreach (ScoringNode s in mil1.Children)
            midNodes.Add(s.Title_Id, s);
            TopLevelScoreNode mIL2 = new TopLevelScoreNode() { Title_Id="MIL2", Description = "MIL2 - Planned" };
            mIL2.TopLevelChild = mil1;
            midNodes.Add(mIL2.Title_Id, mIL2);
            TopLevelScoreNode mIL3 = new TopLevelScoreNode() { Title_Id="MIL3", Description = "MIL3 - Managed" };
            mIL3.TopLevelChild = mIL2;
            midNodes.Add(mIL3.Title_Id, mIL3);
            TopLevelScoreNode mIL4 = new TopLevelScoreNode() { Title_Id="MIL4", Description = "MIL4 - Measured" };
            mIL4.TopLevelChild = mIL3;
            midNodes.Add(mIL4.Title_Id, mIL4);
            TopLevelScoreNode mIL5 = new TopLevelScoreNode() { Title_Id="MIL5", Description = "MIL5 - Defined" };
            mIL5.TopLevelChild = mIL4;
            midNodes.Add(mIL5.Title_Id, mIL5);
            return mIL5;
        }

        public List<EDMscore> GetScores()
        {
            List<EDMscore> scores = new List<EDMscore>();
            topNode.CalculateScoreStatus(scores);
            return scores;
        }

      

        abstract class ScoringNode
        {
            public ScoringNode()
            {
                this.Children = new List<ScoringNode>();
                this.ColorStatus = ScoreStatus.None;
            }
            public ScoreStatus ColorStatus{get;set;}
            public abstract ScoreStatus CalculateScoreStatus(List<EDMscore> scores);            
            public ScoreStatus basicScore(List<EDMscore> scores)
            {
                bool yellow = false;
                bool green = false;
                bool red = false;
                foreach (ScoringNode n in this.Children)
                {
                    switch (n.CalculateScoreStatus(scores))
                    {
                        case ScoreStatus.Green:
                            green = true;
                            break;
                        case ScoreStatus.Yellow:
                            yellow = true;
                            break;
                        case ScoreStatus.Red:
                            red = true;
                            break;
                    }
                }
                ScoreStatus temp = ScoreStatus.None;
                //its all red
                if (!green && !yellow)
                {
                    temp = ScoreStatus.Red;
                }
                //all green 
                else if (green && (!red && !yellow))
                {
                    temp = ScoreStatus.Green;
                }
                // there is some kind of mix
                else
                    temp = ScoreStatus.Yellow;
                return temp;
            }
            public int Grouping_Id { get; set; }
            public List<ScoringNode> Children { get; set; }

            public string Title_Id { get; set; }
            public string Description { get; set; }

        }
        class LeafNode : ScoringNode
        {
            
            public String Answer { get; set; }
            public int Mat_Question_Id { get; set; }
            public ScoringNode Parent { get; internal set; }

            public override ScoreStatus CalculateScoreStatus(List<EDMscore> scores)
            {
                if (this.ColorStatus != ScoreStatus.None)
                    return this.ColorStatus;
                //this one just returns its score color
                //RED, YELLOW, or GREEN
                ScoreStatus score = ScoreStatus.None;
                switch (Answer) {
                    case "Y":
                        score = ScoreStatus.Green;
                        break;
                    case "N":
                        score = ScoreStatus.Red;
                        break;
                    default:
                        score = ScoreStatus.Yellow;
                        break;
                }
                this.ColorStatus = score;
                scores.Add(new EDMscore() { Title_Id = this.Title_Id, Color = this.ColorStatus.ToString() });
                return score;
            }
        }
        class MidlevelScoreNode : ScoringNode
        {   
            public override ScoreStatus CalculateScoreStatus(List<EDMscore> scores)
            {
                //if (this.ColorStatus != ScoreStatus.None)
                //    return this.ColorStatus;
                //this one looks at all its children and 
                //return red if they are all red
                //yellow if anything is not red but not all green
                //green if they are all green
                ScoreStatus score = basicScore(scores);
                this.ColorStatus = score;
                scores.Add(new EDMscore() { Title_Id = this.Title_Id, Color = this.ColorStatus.ToString() });
                return score;
            }
        }
        class TopLevelScoreNode : ScoringNode
        {   
            public ScoringNode TopLevelChild { get; set; }
            
            public override ScoreStatus CalculateScoreStatus(List<EDMscore> scores)
            {   
                if (this.ColorStatus != ScoreStatus.None)
                    return this.ColorStatus;
               
                //if this is MIL 1 then it can be yellow 
                //  (Yellow if any of my children are not red)
                //else this is green if all my children are green
                //else red                
                if (this.Title_Id == "MIL1")
                {
                    this.ColorStatus = basicScore(scores);
                }
                else
                {
                    bool ok = false;
                    ok = TopLevelChild.CalculateScoreStatus(scores) == ScoreStatus.Green;
                    foreach (ScoringNode n in this.Children)
                    {
                        ok = ok && n.CalculateScoreStatus(scores)==ScoreStatus.Green;
                    }
                    this.ColorStatus = ok ? ScoreStatus.Green : ScoreStatus.Red;
                }
                scores.Add(new EDMscore() { Title_Id = this.Title_Id, Color = this.ColorStatus.ToString() });
                return this.ColorStatus;
                
            }
        }
    }
    enum ScoreStatus
    {
        BlueGray,
        Red,
        Yellow,
        Green,
        None
    }

    public class EDMscore
    {
        public string Title_Id { get; set; }        
        public string Color { get;set;}      
    }
}
