import React from 'react';

export default function ProjectOverview({ description, implementation, points, tagline }) {
  return <div className="project-overview">
    {tagline && <p className="project-subtitle">{tagline}</p>}
    <p className="project-purpose">{description}</p>
    {points ? <ul className="project-implementation-points">{points.map((point, index) => <li key={point}><span>{String(index + 1).padStart(2, '0')}</span>{point}</li>)}</ul> : <div className="project-implementation">
      <p>{implementation}</p>
    </div>}
  </div>;
}
