import ballistic from './ballistic';
import blast from './blast';
import burns from './burns';
import crush from './crush';
import environmental from './environmental';
import penetrating from './penetrating';
import other from './other';
import { InjuryProfile } from '../types';

const injuryProfiles: Record<string, InjuryProfile> = {
  ...ballistic,
  ...blast,
  ...burns,
  ...crush,
  ...environmental,
  ...penetrating,
  ...other,
};

export default injuryProfiles;
