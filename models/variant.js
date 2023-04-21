const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SpecificationSchema = new Schema({
    central_locking: {
        type: String,
        default: "-"
    },
    power_windows: {
        type: String,
        default: "-"
    },
    ventilation_system: {
        type: String,
        default: "-"
    },
    length: {
        type: String,
        default: "-"
    },
    width: {
        type: String,
        default: "-"
    },
    height: {
        type: String,
        default: "-"
    },
    seating_capacity: {
        type: String,
        default: "-"
    },
    displacement: {
        type: String,
        default: "-"
    },
    torque: {
        type: String,
        default: "-"
    },
    fuel_type: {
        type: String,
        default: "-"
    },
    arai_certified_mileage: {
        type: String,
        default: "-"
    },
    drivetrain: {
        type: String,
        default: "-"
    },
    type: {
        type: String,
        default: "-"
    },
    gears: {
        type: String,
        default: "-"
    },
    body_type: {
        type: String,
        default: "-"
    },
    doors: {
        type: String,
        default: "-"
    },
    cylinder_configuration: {
        type: String,
        default: "-"
    },
    cylinders: {
        type: String,
        default: "-"
    },
    valves_per_cylinder: {
        type: String,
        default: "-"
    },
    power: {
        type: String,
        default: "-"
    },
    engine_location: {
        type: String,
        default: "-"
    },
    fuel_system: {
        type: String,
        default: "-"
    },
    emission_norm: {
        type: String,
        default: "-"
    },
    city_mileage: {
        type: String,
        default: "-"
    },
    highway_mileage: {
        type: String,
        default: "-"
    },
    front_brakes: {
        type: String,
        default: "-"
    },
    rear_brakes: {
        type: String,
        default: "-"
    },
    front_suspension: {
        type: String,
        default: "-"
    },
    rear_suspension: {
        type: String,
        default: "-"
    },
    front_tyre_andamp_rim: {
        type: String,
        default: "-"
    },
    rear_tyre_andamp_rim: {
        type: String,
        default: "-"
    },
    wheels_size: {
        type: String,
        default: "-"
    },
    handbrake: {
        type: String,
        default: "-"
    },
    engine_immobilizer: {
        type: String,
        default: "-"
    },
    child_safety_locks: {
        type: String,
        default: "-"
    },
    power_steering: {
        type: String,
        default: "-"
    },
    instrument_console: {
        type: String,
        default: "-"
    },
    multifunction_display: {
        type: String,
        default: "-"
    },
    seats_material: {
        type: String,
        default: "-"
    },
    sun_visor: {
        type: String,
        default: "-"
    },
    clock: {
        type: String,
        default: "-"
    },
    audiosystem: {
        type: String,
        default: "-"
    },
    boot_lid_opener: {
        type: String,
        default: "-"
    },
    fuel_lid_opener: {
        type: String,
        default: "-"
    },
    twelve_volt_power_outlet: {
        type: String,
        default: "-"
    },
    third_row_ac_vents: {
        type: String,
        default: "-"
    },
    cd_mp3_dvd_player: {
        type: String,
        default: "-"
    },
    fm_radio: {
        type: String,
        default: "-"
    },
    usb_compatibility: {
        type: String,
        default: "-"
    },
    aux_in_compatibility: {
        type: String,
        default: "-"
    },
    cup_holders: {
        type: String,
        default: "-"
    },
    door_pockets: {
        type: String,
        default: "-"
    },
    tachometer: {
        type: String,
        default: "-"
    },
    odometer: {
        type: String,
        default: "-"
    },
    tripmeter: {
        type: String,
        default: "-"
    },
    fuel_gauge: {
        type: String,
        default: "-"
    },
    engine_malfunction_light: {
        type: String,
        default: "-"
    },
    speedometer: {
        type: String,
        default: "-"
    },
    low_fuel_warning: {
        type: String,
        default: "-"
    },
    basic_warranty: {
        type: String,
        default: "-"
    },
    extended_warranty: {
        type: String,
        default: "-"
    },
    wheelbase: {
        type: String,
        default: "-"
    },
    front_track: {
        type: String,
        default: "-"
    },
    rear_track: {
        type: String,
        default: "-"
    },
    ground_clearance: {
        type: String,
        default: "-"
    },
    kerb_weight: {
        type: String,
        default: "-"
    },
    gross_vehicle_weight: {
        type: String,
        default: "-"
    },
    boot_space: {
        type: String,
        default: "-"
    },
    fuel_tank_capacity: {
        type: String,
        default: "-"
    },
    minimum_turning_radius: {
        type: String,
        default: "-"
    },
    airbags: {
        type: String,
        default: "-"
    },
    number_of_airbags: {
        type: String,
        default: "-"
    },
    keyless_entry: {
        type: String,
        default: "-"
    },
    compression_ratio: {
        type: String,
        default: "-"
    },
    seat_back_pockets: {
        type: String,
        default: "-"
    },
    adjustable_headrests: {
        type: String,
        default: "-"
    },
    other_specs: {
        type: String,
        default: "-"
    },
    adjustable_steering_column: {
        type: String,
        default: "-"
    },
    gear_indicator: {
        type: String,
        default: "-"
    },
    key_off_reminder: {
        type: String,
        default: "-"
    },
    headlight_reminder: {
        type: String,
        default: "-"
    },
    fasten_seat_belt_warning: {
        type: String,
        default: "-"
    },
    gear_shift_reminder: {
        type: String,
        default: "-"
    },
    abs_anti_lock_braking_system: {
        type: String,
        default: "-"
    },
    door_ajar_warning: {
        type: String,
        default: "-"
    },
    distance_to_empty: {
        type: String,
        default: "-"
    },
    average_fuel_consumption: {
        type: String,
        default: "-"
    },
    multifunction_steering_wheel: {
        type: String,
        default: "-"
    },
    bluetooth: {
        type: String,
        default: "-"
    },
    seat_height_adjustment: {
        type: String,
        default: "-"
    },
    isofix_child_seat_mount: {
        type: String,
        default: "-"
    },
    ebd_electronic_brake_force_distribution: {
        type: String,
        default: "-"
    },
    navigation_system: {
        type: String,
        default: "-"
    },
    cigarette_lighter: {
        type: String,
        default: "-"
    },
    average_speed: {
        type: String,
        default: "-"
    },
    parking_assistance: {
        type: String,
        default: "-"
    },
    start_stop_button: {
        type: String,
        default: "-"
    },
    rain_sensing_wipers: {
        type: String,
        default: "-"
    },
    infotainment_screen: {
        type: String,
        default: "-"
    },
    paddle_shifters: {
        type: String,
        default: "-"
    },
    turbocharger: {
        type: String,
        default: "-"
    },
    eba_electronic_brake_assist: {
        type: String,
        default: "-"
    },
    leather_wrapped_steering: {
        type: String,
        default: "-"
    },
    automatic_headlamps: {
        type: String,
        default: "-"
    },
    ipod_compatibility: {
        type: String,
        default: "-"
    },
    rear_center_armrest: {
        type: String,
        default: "-"
    },
    second_row_ac_vents: {
        type: String,
        default: "-"
    },
    hill_assist: {
        type: String,
        default: "-"
    },
    tyre_pressure_monitoring_system: {
        type: String,
        default: "-"
    },
    cruise_control: {
        type: String,
        default: "-"
    },
    cooled_glove_box: {
        type: String,
        default: "-"
    },
    heated_seats: {
        type: String,
        default: "-"
    },
    power_seats: {
        type: String,
        default: "-"
    },
    esp_electronic_stability_program: {
        type: String,
        default: "-"
    },
    asr_traction_control: {
        type: String,
        default: "-"
    },
    electric_range: {
        type: String,
        default: "-"
    },
    battery: {
        type: String,
        default: "-"
    },
    recommended_tyre_pressure: {
        type: String,
        default: "-"
    }
});


const ServiceSchema = new Schema({
    service: {
        type: String,
    },

    type: {
        type: String,
        //enum: ['Customization','Diagnosis','Washing And Detailings','Collision Repair'],
    },

    inclusions: [],

    service_charges: {
        type: Number,
        default: 0
    },

    status: {
        type: Boolean,
        default: false
    },
});


const VariantSchema = new Schema({
    automaker: {
        type: Schema.ObjectId,
        ref: 'Automaker',
    },
    // model: {
    //     type: Schema.ObjectId,
    //     ref: 'Model',

    // },
    _automaker: {
        type: String,
    },

    model: {
        type: Schema.ObjectId,
        ref: 'Model',
    },

    _model: {
        type: String,
    },

    segment: {
        type: String,
    },

    variant: {
        type: String,
    },

    value: {
        type: String,
    },

    price: {
        type: Number,
    },

    specification: SpecificationSchema,

    type: {
        type: String,
    },

    service_schedule: [ServiceSchema]
});

/*VariantSchema.virtual('value').get(function() {  
    return this.variant;
});*/

VariantSchema.set('toObject', { virtuals: true });
VariantSchema.set('toJSON', { virtuals: true });

const Variant = mongoose.model('Variant', VariantSchema, 'Variant');

module.exports = Variant;