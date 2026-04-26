package com.example.io;

import java.io.FileWriter;
import java.util.Random;

public class DataGenerator {

    public static void main(String[] args) throws Exception {
        Random rand = new Random();

        for (int i = 1; i <= 70; i++) {
            int size = 100 + rand.nextInt(9901);

            FileWriter fw = new FileWriter("data/data_" + i + ".txt");
            fw.write(size + "\n");

            for (int j = 0; j < size; j++) {
                fw.write(rand.nextDouble()*10000 + " " +
                         rand.nextDouble()*10000 + "\n");
            }

            fw.close();
        }
    }
}