import {
    AngryBirdIcon,
    Backpack03Icon,
    BicycleIcon,
    CowboyHatIcon,
    Directions01Icon,
    Directions02Icon, EquipmentGym03Icon,
    FirePitIcon,
    FishFoodIcon,
    FootballPitchIcon,
    MoreIcon,
    SkippingRopeIcon,
    SunsetIcon,
    SwimmingIcon,
    TruckDeliveryIcon,
    TruckMonsterIcon,
    WorkoutRunIcon,
    WorkoutSportIcon
} from "@hugeicons/react-pro";

const interests = [
    {
        label: 'Hiking',
        icon: <Directions01Icon size={20} variant="twotone" />,
        value: 'hiking'
    },
    {
        label: 'Running',
            icon: <WorkoutRunIcon size={20} variant="twotone" />,
        value: 'running'
    },
    {
        label: 'Camping',
            icon: <FirePitIcon size={20} variant="twotone" />,
        value: 'camping'
    },
    {
        label: 'Bicycle',
            icon: <BicycleIcon size={20} variant="twotone" />,
        value: 'bicycle'
    },
    {
        label: 'Backpacking',
            icon: <Backpack03Icon size={20} variant="twotone" />,
        value: 'backpacking'
    },
    {
        label: 'Walking',
            icon: <WorkoutSportIcon size={20} variant="twotone" />,
        value: 'walking'
    },
    {
        label: 'Off-road Driving',
            icon: <TruckMonsterIcon size={20} variant="twotone" />,
        value: 'off-road-driving'
    },
    {
        label: 'Horse Riding',
            icon: <CowboyHatIcon size={20} variant="twotone" />,
        value: 'horse-riding'
    },
    {
        label: 'Parks & Museums',
            icon: <Directions02Icon size={20} variant="twotone" />,
        value: 'parks-&-museums'
    },
    {
        label: 'Fishing',
            icon: <FishFoodIcon size={20} variant="twotone" />,
        value: 'fishing'
    },
    {
        label: 'Scenic Driving/Road Trip',
            icon: <TruckDeliveryIcon size={20} variant="twotone" />,
        value: 'scenic-driving-road-trip'
    },
    {
        label: 'Sunset',
            icon: <SunsetIcon size={20} variant="twotone" />,
        value: 'sunset'
    },
    {
        label: 'Rock Climbing',
            icon: <SkippingRopeIcon size={20} variant="twotone" />,
        value: 'rock-climbing'
    },
    {
        label: 'Water Sports',
            icon: <SwimmingIcon size={20} variant="twotone" />,
        value: 'water-sports'
    },
    {
        label: 'Sports Activity',
            icon: <FootballPitchIcon size={20} variant="twotone" />,
        value: 'sports-activity'
    },
    {
        label: 'Bird Watching',
            icon: <AngryBirdIcon size={20} variant="twotone" />,
        value: 'bird-watching'
    },
    {
        label: 'Gym',
            icon: <EquipmentGym03Icon size={20} variant="twotone" />,
        value: 'gym'
    },
    {
        label: 'Other',
        icon: <MoreIcon size={20} variant="twotone" />,
        value: 'other'
    },
];

export { interests }