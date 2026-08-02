import { SceneContainer } from './SceneContainer';

export function ChatScene() {
  return (
    <SceneContainer scene="chat">
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-8">
        <div className="w-full max-w-52 self-start rounded-2xl rounded-bl-sm bg-white/15 p-3">
          <div className="h-2.5 w-4/5 rounded-full bg-white/50" />
          <div className="mt-2 h-2.5 w-1/2 rounded-full bg-white/50" />
        </div>
        <div className="w-full max-w-52 self-end rounded-2xl rounded-br-sm bg-sg-xp/85 p-3">
          <div className="ml-auto h-2.5 w-2/3 rounded-full bg-white/90" />
        </div>
        <div className="w-full max-w-40 self-start rounded-2xl rounded-bl-sm bg-white/15 p-3">
          <div className="h-2.5 w-3/5 rounded-full bg-white/50" />
        </div>
      </div>
      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1">
        {[0, 1, 2].map((i) => (
          <span key={i} className="size-1.5 rounded-full bg-white/60" />
        ))}
      </div>
    </SceneContainer>
  );
}
