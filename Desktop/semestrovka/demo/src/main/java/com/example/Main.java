package com.example;

import com.example.algorithm.ChansAlgorithm;
import com.example.io.DataReader;
import com.example.model.Point;
import com.example.util.Metrics;

import java.io.FileWriter;
import java.util.List;

public class Main {

    public static void main(String[] args) throws Exception {

        FileWriter fw = new FileWriter("results.csv");
        fw.write("N,Time,Iterations,h\n");

        for (int i = 1; i <= 70; i++) {
            List<Point> points =
                    DataReader.read("data_" + i + ".txt");

            Metrics.iterations = 0;

            long start = System.nanoTime();
            List<Point> hull = ChansAlgorithm.run(points);
            long end = System.nanoTime();

            fw.write(points.size() + "," +
                    (end - start) + "," +
                    Metrics.iterations + "," + hull.size() + "\n");

            System.out.println("Test " + i);
            System.out.println("N = " + points.size());
            System.out.println("Time = " + (end - start));
            System.out.println("Iterations = " + Metrics.iterations);
            System.out.println("Hull size = " + hull.size());
            System.out.println("----------------");
        }

        fw.close();
    }
}