type SidebarProps = {
  setTab: React.Dispatch<React.SetStateAction<number>>;
};

export default function Sidebar({ setTab }: SidebarProps) {
  return (
    <div className="sidebar">
      <h2>Dashboard</h2>
      <ul>
        <li onClick={() => setTab(1)}>History</li>
        <li onClick={() => setTab(2)}>Total Coin</li>
        <li onClick={() => setTab(3)}>Get amount by wallet id</li>
      </ul>
    </div>
  );
}
