/**
 * HeroBanner
 * Uses the real uploaded mangrove / SpeakUp banner image.
 * The image already contains the dark overlay panel, badge, and wordmark,
 * so we simply display it full-width at the correct aspect ratio.
 */
import { HERO_SRC } from '../assets/images.js'

export default function HeroBanner() {
  return (
    <div className="w-full overflow-hidden">
      <img
        src={HERO_SRC}
        alt="When values are deeply rooted, ethical culture thrives – SpeakUp"
        className="w-full object-cover block"
        style={{ maxHeight: '220px', objectPosition: 'center center' }}
      />
    </div>
  )
}
