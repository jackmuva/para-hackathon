import Login from "@/app/components/ui/integration/login";

interface ChildProps {
    user: {allowed: boolean, email: string}
}
const Integrations: React.FC<ChildProps> = (props) => {
    return (
      <div className={"flex justify-center absolute top-36 left-1/2 transform -translate-x-1/2 -translate-y-1/2"}>
          <Login/>
      </div>
    );
}
export default Integrations;