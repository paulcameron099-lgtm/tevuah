import JointInvitationClient from "./joint-invitation-client";


type JointInvitationPageProps = {
  params: Promise<{
    token: string;
  }>;
};


export default async function JointInvitationPage({
  params,
}: JointInvitationPageProps) {
  const { token } =
    await params;

  return (
    <JointInvitationClient
      token={token}
    />
  );
}