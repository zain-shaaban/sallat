import { Module } from "@nestjs/common";
import { OnlineDrivers } from "./online-drivers";


@Module({
    providers:[OnlineDrivers],
    exports:[OnlineDrivers]
})
export class OnlineDriversModule{}