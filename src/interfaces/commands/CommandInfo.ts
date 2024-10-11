import AuxdibotFeatureModule from './AuxdibotFeatureModule';

export default interface CommandInfo {
   module: AuxdibotFeatureModule;
   usageExample: string;
   description: string;
   allowedDefault?: boolean;
   premium?: 'user' | 'guild';
   permissionsRequired?: bigint[];
   dmableCommand?: boolean;
}
