import { useNavigate } from "react-router-dom";
import MobileNav from "../../components/feature/MobileNav";

const statBlocks = [
  { label: "Total Study Days", value: "128", icon: "ri-calendar-check-line", color: "bg-blue-50 text-blue-500" },
  { label: "Total XP Earned", value: "34,520", icon: "ri-trophy-line", color: "bg-yellow-50 text-yellow-500" },
  { label: "Words Learned", value: "2,840", icon: "ri-book-2-line", color: "bg-purple-50 text-purple-500" },
  { label: "Quizzes Passed", value: "413", icon: "ri-question-line", color: "bg-green-50 text-green-500" },
  { label: "Current Streak", value: "42 days", icon: "ri-fire-line", color: "bg-orange-50 text-orange-500" },
  { label: "Reviews Done", value: "1,095", icon: "ri-refresh-line", color: "bg-pink-50 text-pink-500" },
];

const OverallStatsPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#f8f9fa] pb-20">
      {/* Header */}
      <div className="fixed top-0 left-0 w-full bg-white z-10 px-4 py-3 flex items-center gap-3 shadow-sm">
        <button
          onClick={() => navigate(-1)}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100"
        >
          <i className="ri-arrow-left-line text-gray-600 text-lg" />
        </button>
        <h1 className="text-base font-bold text-gray-800">Overall Stats</h1>
      </div>

      <div className="pt-16 px-4">
        {/* Summary Banner */}
        <div className="mt-4 bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] rounded-3xl p-5 text-white">
          <p className="text-xs opacity-80 mb-1">Your Learning Journey</p>
          <h2 className="text-2xl font-bold">Amazing Progress! 🎉</h2>
          <p className="text-xs opacity-75 mt-1">Keep pushing — you're in the top 15% of learners.</p>
        </div>

        {/* Stat Grid */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          {statBlocks.map((stat) => (
            <div key={stat.label} className="bg-white rounded-2xl shadow-sm p-4 flex flex-col gap-2">
              <div className={`w-9 h-9 flex items-center justify-center rounded-xl ${stat.color}`}>
                <i className={`${stat.icon} text-lg`} />
              </div>
              <p className="text-lg font-bold text-gray-800">{stat.value}</p>
              <p className="text-xs text-gray-400">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Weekly Chart Placeholder */}
        <div className="bg-white rounded-2xl shadow-sm p-4 mt-4">
          <h3 className="text-sm font-bold text-gray-700 mb-3">Weekly Activity</h3>
          <img
            style={{ background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)" }}
            alt="Weekly chart"
            className="w-full h-36 object-cover object-top rounded-xl"
          />
        </div>
      </div>

      <MobileNav />
    </div>
  );
};

export default OverallStatsPage;
