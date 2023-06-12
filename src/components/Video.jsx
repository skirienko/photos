export default function Video({path, video, poster}) {

    return (
        <div className="stretch">
            <video controls src={`${path}/${video}`} width="100%" height="100%" poster={poster ? `${path}/${poster}` : null}/>
        </div>
    );
}
